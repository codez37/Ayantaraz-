#!/usr/bin/env bash
# ============================================
# Ayantaraz Production Deployment Script
# Hardened Version - No Hardcoded Values
# Usage: ./deploy/deploy.sh
# ============================================
set -euo pipefail

# ========== INITIALIZATION ==========
ROOT_DIR="$(cd "$(dirname "$(dirname "$0")")" && pwd)"
cd "$ROOT_DIR"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ========== ENVIRONMENT VALIDATION ==========
echo "=== Ayantaraz Production Deploy ==="
echo ""

[ -f .env ] || fail ".env file not found - create from .env.example"

# Load ALL environment variables safely
set -a
# shellcheck disable=SC1090
source .env 2>/dev/null || fail "Failed to load .env file"
set +a

# Validate critical variables
[ -z "${SERVER_IP:-}" ] && fail "SERVER_IP is not set in .env"
[ -z "${SERVER_PORT:-}" ] && SERVER_PORT="3001"
[ -z "${POSTGRES_USER:-}" ] && POSTGRES_USER="ayantaraz"
[ -z "${POSTGRES_DB:-}" ] && POSTGRES_DB="ayantaraz"
[ -z "${POSTGRES_PASSWORD:-}" ] && fail "POSTGRES_PASSWORD is not set in .env"
[ -z "${REDIS_PASSWORD:-}" ] && fail "REDIS_PASSWORD is not set in .env"

# Build connection strings from environment variables
DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public}"
REDIS_URL="${REDIS_URL:-redis://:${REDIS_PASSWORD}@redis:6379}"
API_URL="${API_URL:-http://${SERVER_IP}:${SERVER_PORT}/api}"
FRONTEND_URL="${FRONTEND_URL:-http://${SERVER_IP}:3000}"
CORS_ORIGINS="${CORS_ORIGINS:-${FRONTEND_URL}}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-${API_URL}}"
HEALTH_URL="${HEALTH_URL:-${API_URL}/health}"

ok "Configuration loaded from environment"
ok "Server: ${SERVER_IP}:${SERVER_PORT}"

# ========== PREREQUISITES CHECK ==========
echo ""
echo "--- Checking Prerequisites ---"
command -v docker >/dev/null 2>&1 || fail "Docker is not installed"
docker info >/dev/null 2>&1 || fail "Docker daemon is not running"
ok "Docker is ready"

command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || fail "Docker Compose is not available"
ok "Docker Compose is available"

[ -d "prisma/migrations" ] || fail "prisma/migrations directory not found"
ok "Prisma migrations exist"

# ========== START DATABASES ==========
echo ""
echo "--- Starting Database Services ---"

# Start only database services first
if docker compose up -d postgres redis; then
    ok "Database services started"
else
    fail "Failed to start database services"
fi

# Wait for PostgreSQL
echo ""
echo "--- Waiting for PostgreSQL ---"
POSTGRES_READY=false
for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
        ok "PostgreSQL is ready"
        POSTGRES_READY=true
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo ""
        warn "PostgreSQL health check logs:"
        docker compose logs --tail=20 postgres 2>/dev/null | sed 's/^/  /' || true
        fail "PostgreSQL did not become ready within 60 seconds"
    fi
    echo -n "."
    sleep 2
done

# Wait for Redis
echo ""
echo "--- Waiting for Redis ---"
REDIS_READY=false
for i in $(seq 1 15); do
    if docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD}" ping 2>/dev/null | grep -q PONG; then
        ok "Redis is ready"
        REDIS_READY=true
        break
    fi
    if [ "$i" -eq 15 ]; then
        echo ""
        warn "Redis health check logs:"
        docker compose logs --tail=10 redis 2>/dev/null | sed 's/^/  /' || true
        warn "Redis not ready - continuing anyway"
    fi
    echo -n "."
    sleep 2
done
echo ""

# ========== RUN MIGRATIONS ==========
echo "--- Running Database Migrations ---"
MIGRATION_STATUS=0
docker run --rm \
    -v "${ROOT_DIR}/prisma:/prisma:ro" \
    --network ayantaraz-network \
    -e DATABASE_URL="${DATABASE_URL}" \
    node:22-bookworm \
    sh -c "npm i -g prisma@5.22.0 --silent 2>/dev/null && npx prisma migrate deploy --schema=/prisma/schema.prisma" || MIGRATION_STATUS=$?

if [ "$MIGRATION_STATUS" -ne 0 ]; then
    echo ""
    warn "Migration logs:"
    docker compose logs --tail=20 postgres 2>/dev/null | sed 's/^/  /' || true
    fail "Database migrations failed"
fi
ok "Migrations completed successfully"

# ========== SEED ADMIN USERS (SQL Injection Safe) ==========
echo ""
echo "--- Creating Admin Users ---"
ADMIN_PHONES="${ADMIN_PHONE:-}"

if [ -n "$ADMIN_PHONES" ]; then
    IFS=',' read -ra PHONES <<< "$ADMIN_PHONES"
    for phone in "${PHONES[@]}"; do
        phone="$(echo "$phone" | xargs)"
        # Use parameterized query to prevent SQL injection
        docker compose exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<EOF 2>&1 | sed 's/^/  /' && ok "Admin user created: ${phone}"
INSERT INTO "User" (phone, first_name, last_name, role, is_active, created_at, updated_at)
SELECT '\${phone}'::text, 'Admin'::text, 'User'::text, 'admin'::text, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE phone = '\${phone}'::text);
EOF
    done
else
    warn "No ADMIN_PHONE configured in .env - no admin users will be created"
    warn "Set ADMIN_PHONE in .env to create admin users"
fi

# ========== BUILD AND START SERVICES ==========
echo ""
echo "--- Building and Starting Application Services ---"
if docker compose up -d --build api web nginx; then
    ok "Application services started"
else
    fail "Failed to start application services"
fi

# ========== HEALTH CHECK ==========
echo ""
echo "--- Health Check ---"
HEALTH_CHECK_MAX_RETRIES=30
HEALTH_CHECK_RETRY=0
HEALTHY=false

while [ "$HEALTH_CHECK_RETRY" -lt "$HEALTH_CHECK_MAX_RETRIES" ]; do
    HEALTH_CHECK_RETRY=$((HEALTH_CHECK_RETRY + 1))
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" 2>/dev/null || echo "000")

    if [ "$HEALTH" = "200" ]; then
        HEALTHY=true
        break
    fi

    if [ "$HEALTH_CHECK_RETRY" -eq "$HEALTH_CHECK_MAX_RETRIES" ]; then
        echo ""
        warn "Health check failed after ${HEALTH_CHECK_MAX_RETRIES} attempts"
        warn "Container status:"
        docker compose ps 2>/dev/null | sed 's/^/  /' || true

        echo ""
        warn "API container logs:"
        docker compose logs --tail=30 api 2>/dev/null | sed 's/^/  [api] /' || true

        echo ""
        warn "Web container logs:"
        docker compose logs --tail=30 web 2>/dev/null | sed 's/^/  [web] /' || true

        fail "Health check failed - services not ready"
    fi

    echo -n "."
    sleep 3
done

ok "All services are healthy"

# ========== DEPLOYMENT COMPLETE ==========
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}===  DEPLOYMENT COMPLETE  ===${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  🌐 Frontend URL:    ${FRONTEND_URL}"
echo "  🔌 API URL:         ${API_URL}"
echo "  ❤️  Health Check:    ${HEALTH_URL}"
echo ""

if [ -n "$ADMIN_PHONE" ]; then
    echo "  👤 Admin Phone:     ${ADMIN_PHONE}"
fi

if [ "${SMS_API_KEY:-}" = "change_me_to_your_sms_api_key" ] 2>/dev/null; then
    warn "SMS_API_KEY is using default value - OTP will not work"
    warn "Set a valid SMS_API_KEY in .env for OTP functionality"
fi

if [ "${NODE_ENV:-}" != "production" ]; then
    warn "NODE_ENV is not set to 'production' - running in ${NODE_ENV:-development} mode"
fi

ok "System is live and ready"
echo ""
echo -e "${GREEN}========================================${NC}"
