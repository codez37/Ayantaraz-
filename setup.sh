#!/usr/bin/env bash
set -uo pipefail

# ============================================
# Ayantaraz — Production Setup
# ============================================
#   cp .env.example .env
#   nano .env        # edit SMS_API_KEY
#   bash setup.sh
# ============================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠${NC} $1"; }
fail(){ echo -e "${RED}✗${NC} $1"; exit 1; }

echo "=== Ayantaraz Production Setup ==="
echo ""

# ── 0. .env must exist ────────────────────────
[ -f .env ] || fail ".env not found — run: cp .env.example .env"
sed -i 's/\r$//' .env

# ── 1. Read .env line by line ─────────────────
while IFS='=' read -r k v; do
  [ -z "$k" ] && continue
  case "$k" in '#'*) continue ;; esac
  k="$(echo "$k" | xargs)"
  v="$(echo "$v" | xargs)"
  export "$k=$v"
done < .env

SERVER_IP="${SERVER_IP:-}"
[ -z "$SERVER_IP" ] && fail "SERVER_IP is empty in .env"
[ "$SERVER_IP" = "CHANGE_ME" ] && fail "Set SERVER_IP in .env"
ok "SERVER_IP = ${SERVER_IP}"

SMS_API_KEY="${SMS_API_KEY:-}"
[ -z "$SMS_API_KEY" ] || [ "$SMS_API_KEY" = "CHANGE_ME" ] && warn "SMS_API_KEY not set — OTP disabled"

# ── 2. Auto-generate missing secrets ──────────
gen() { openssl rand -base64 32 2>/dev/null | tr -d '/+=' | cut -c1-32; }
upd() {
  local k="$1" v="$2"
  v="$(echo "$v" | sed 's/[\/&]/\\&/g')"
  sed -i "s/^${k}=.*/${k}=${v}/" .env
}

for key in POSTGRES_PASSWORD REDIS_PASSWORD JWT_SECRET JWT_REFRESH_SECRET FILE_ENCRYPTION_KEY; do
  val="${!key:-}"
  [ -n "$val" ] && continue
  val="$(gen)"
  export "$key=$val"
  upd "$key" "$val"
  ok "${key} generated"
done

# ── 3. Compute derived values ─────────────────
DATABASE_URL="postgresql://ayantaraz:${POSTGRES_PASSWORD}@postgres:5432/ayantaraz?schema=public"
REDIS_URL="redis://:${REDIS_PASSWORD}@redis:6379"
CORS_ORIGINS="http://${SERVER_IP}"
NEXT_PUBLIC_API_URL="http://${SERVER_IP}/api"

upd "DATABASE_URL" "$DATABASE_URL"
upd "REDIS_URL" "$REDIS_URL"
upd "CORS_ORIGINS" "$CORS_ORIGINS"
upd "NEXT_PUBLIC_API_URL" "$NEXT_PUBLIC_API_URL"
ok "Derived values written to .env"

echo ""
echo "--- Configuration ---"
echo "  Server:    ${SERVER_IP}"
echo "  DB URL:    ${DATABASE_URL}"
echo "  CORS:      ${CORS_ORIGINS}"
echo "  Admin:     ${ADMIN_PHONE:-09120000000}"
echo ""

# ── 4. Clean old volumes (fresh start) ────────
if docker compose ps -q postgres >/dev/null 2>&1; then
  echo "--- Removing stale containers & volumes ---"
  docker compose down -v 2>/dev/null || true
  ok "Old containers & volumes removed"
fi

# ── 5. Start databases ────────────────────────
echo "--- Starting Databases ---"
docker compose up -d postgres redis
ok "Databases started"

# ── 5. Wait for postgres ──────────────────────
echo -n "Waiting for postgres"
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U ayantaraz -d ayantaraz >/dev/null 2>&1; then
    echo ""; ok "Postgres ready"; break
  fi
  [ "$i" -eq 30 ] && { echo ""; docker compose logs --tail=5 postgres; fail "Postgres did not start"; }
  echo -n "."; sleep 2
done

# ── 6. Wait for redis ────────────────────────
echo -n "Waiting for redis"
for i in $(seq 1 15); do
  if docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD}" ping 2>/dev/null | grep -q PONG; then
    echo ""; ok "Redis ready"; break
  fi
  [ "$i" -eq 15 ] && { echo ""; warn "Redis not ready — continuing"; }
  echo -n "."; sleep 2
done
echo ""

# ── 7. Database migrations ────────────────────
echo ""
echo "--- Running Migrations ---"
docker run --rm \
  -v "$(pwd)/prisma:/prisma:ro" \
  --network ayantaraz-network \
  -e DATABASE_URL="${DATABASE_URL}" \
  node:22-alpine \
  sh -c "
    apk add --no-cache openssl >/dev/null 2>&1
    npm i -g prisma@5.22.0 --silent 2>/dev/null
    npx prisma migrate deploy --schema=/prisma/schema.prisma
  " 2>&1 | sed 's/^/  /'
ok "Migrations complete"

# ── 8. Seed admin users ──────────────────────
echo ""
echo "--- Creating Admin Users ---"
ADMIN_PHONES="${ADMIN_PHONE:-09120000000}"
IFS=',' read -ra PHONES <<< "$ADMIN_PHONES"
for phone in "${PHONES[@]}"; do
  phone="$(echo "$phone" | xargs)"
  docker compose exec -T postgres psql -U ayantaraz -d ayantaraz -c "
INSERT INTO \"User\" (phone, first_name, last_name, role, is_active, created_at, updated_at)
SELECT '${phone}', 'مدیر', 'سیستم', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM \"User\" WHERE phone = '${phone}');
" 2>&1 | sed 's/^/  /' && ok "Admin: ${phone}"
done

# ── 9. Build & start services ────────────────
echo ""
echo "--- Building & Starting Services ---"
docker compose up -d --build api web nginx 2>&1 | sed 's/^/  /'

# ── 10. Health check ─────────────────────────
echo ""
echo -n "Waiting for services"
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    echo ""; ok "All services healthy"; break
  fi
  if [ "$i" -eq 30 ]; then
    echo ""; warn "Health check timeout — logs:"
    docker compose logs --tail=10 api 2>/dev/null | sed 's/^/  /'
    docker compose ps 2>/dev/null | sed 's/^/  /'
  fi
  echo -n "."; sleep 3
done
echo ""

# ── 11. Done ─────────────────────────────────
echo ""
echo -e "${GREEN}=== Ayantaraz is LIVE ===${NC}"
echo "  URL:      http://${SERVER_IP}"
echo "  API:      http://${SERVER_IP}/api"
echo "  Health:   http://${SERVER_IP}/health"
echo "  Admin:    ${ADMIN_PHONE:-09120000000}"
echo ""
[ -z "${SMS_API_KEY:-}" ] || [ "$SMS_API_KEY" = "CHANGE_ME" ] && warn "Set SMS_API_KEY in .env for OTP"
ok "Deployment complete"
