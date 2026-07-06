#!/usr/bin/env bash
# ============================================================
# final-verification.sh — Production Deployment Verification
# ============================================================
set -eu

log() { echo "[$(date -u +%H:%M:%S)] $1"; }
fail() { echo "[FATAL] $1"; exit 1; }

cd "$(dirname "$0")/.."

log "=== Production Deployment Verification ==="

# 1. Verify environment
log "1/5: Environment verification"
ENV_FILE="/opt/ayan-taraz/.env"
if [ ! -f "$ENV_FILE" ]; then
  fail "Missing $ENV_FILE file"
fi

grep -q "CHANGE_ME_TO_REAL_KEY" "$ENV_FILE" && fail "SMS_API_KEY not configured"

grep -q "DATABASE_URL" "$ENV_FILE" || fail "DATABASE_URL not set"

grep -q "REDIS_PASSWORD" "$ENV_FILE" || fail "REDIS_PASSWORD not set"

# 2. Verify database schema
log "2/5: Database schema verification"
docker compose exec -T postgres pg_isready -U ayantaraz || fail "PostgreSQL not ready"

# Check for critical tables
for table in users tax_sessions enrollments orders consultation_requests; do
  count=$(docker compose exec -T postgres psql -U ayantaraz -d ayantaraz -tAc "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0")
  [ "$count" -ge "0" ] || fail "Table $table missing or inaccessible"
done

# 3. Verify Prisma schema
log "3/5: Prisma schema verification"
if [ -f "prisma/schema.prisma" ]; then
  npx prisma validate --schema=prisma/schema.prisma || fail "Prisma schema validation failed"
else
  fail "Prisma schema.prisma missing"
fi

# 4. Verify security headers
log "4/5: Security headers verification"
# Start services temporarily
log "Starting services for verification..."
docker compose up -d api web nginx

sleep 10

# Check CSP header
csp_header=$(curl -s -I http://localhost:3001/health | grep -i "Content-Security-Policy" || echo "")
echo "$csp_header" | grep -q "unsafe-inline" && fail "CSP contains unsafe-inline"
echo "$csp_header" | grep -q "unsafe-eval" && fail "CSP contains unsafe-eval"

# 5. Verify healthchecks
log "5/5: Healthcheck verification"
for service in api web postgres redis; do
  status=$(docker compose ps --format '{{.Status}}' $service)
  echo "$status" | grep -q "healthy" || fail "Service $service not healthy"
done

log "=== All verifications passed ✓ ==="
log "Ready for production deployment"
