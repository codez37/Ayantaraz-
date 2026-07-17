#!/usr/bin/env bash
set -euo pipefail

log() { echo "[$(date -u +%H:%M:%S)] $1"; }
fail() { echo "[FATAL] $1" >&2; exit 1; }

cd "$(dirname "$0")/.."
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)
COMPOSE=(docker compose "${COMPOSE_FILES[@]}")

log "=== Production Deployment Verification ==="

log "1/5: Environment verification"
[ -f "$ENV_FILE" ] || fail "Missing $ENV_FILE file"
for key in DATABASE_URL REDIS_URL REDIS_PASSWORD POSTGRES_PASSWORD JWT_SECRET JWT_REFRESH_SECRET FILE_ENCRYPTION_KEY SMS_API_KEY; do
  grep -Eq "^${key}=.+" "$ENV_FILE" || fail "$key is not set in $ENV_FILE"
  grep -Eq "^${key}=.*(CHANGE_ME|YOUR_|missing)" "$ENV_FILE" && fail "$key still contains a placeholder"
done

log "2/5: Compose configuration verification"
"${COMPOSE[@]}" config >/tmp/ayantaraz-compose.yml || fail "docker compose config failed"
for service in api web nginx db redis; do
  grep -Eq "^[[:space:]]{2}${service}:" /tmp/ayantaraz-compose.yml || fail "Compose service missing: $service"
done

log "3/5: Prisma schema verification"
npx prisma validate --schema=prisma/schema.prisma || fail "Prisma schema validation failed"

log "4/5: Starting production stack"
"${COMPOSE[@]}" up -d --build db redis api web nginx || fail "Production stack failed to start"

log "5/5: Healthcheck verification"
for service in db redis api web nginx; do
  for attempt in $(seq 1 30); do
    status=$("${COMPOSE[@]}" ps --format json "$service" 2>/dev/null | sed -n 's/.*"Health":"\([^"]*\)".*/\1/p' | head -1)
    [ "$status" = "healthy" ] && break
    sleep 2
  done
  [ "${status:-}" = "healthy" ] || fail "Service $service not healthy (last status: ${status:-unknown})"
done

curl -fsS http://127.0.0.1/health >/dev/null || fail "Public /health endpoint failed"
curl -fsS http://127.0.0.1/api/health >/dev/null || fail "Public /api/health endpoint failed"

log "=== All verifications passed ✓ ==="
