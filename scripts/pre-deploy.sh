#!/bin/bash
# ============================================================
# PRE-DEPLOY - run in CI/CD before docker build
# ============================================================
set -euo pipefail

info()  { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [INFO]  $1"; }
warn()  { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [WARN]  $1"; }
fatal() { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [FATAL] $1"; exit 1; }

# 0. Schema-migration alignment guard (run before build to fail fast)
# Schema change without migration artifact is an invalid state — enforce at CI boundary
info "Checking schema-migration alignment"
BASE_BRANCH="${CI_BASE_BRANCH:-origin/main}"
SCHEMA_CHANGED=false
if git diff --name-only "${BASE_BRANCH}...HEAD" 2>/dev/null | grep -q "prisma/schema.prisma"; then
  SCHEMA_CHANGED=true
fi

MIGRATION_EXISTS=false
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  MIGRATION_EXISTS=true
fi

if [ "$SCHEMA_CHANGED" = true ] && [ "$MIGRATION_EXISTS" = false ]; then
  fatal "schema.prisma changed but no migration artifact exists — run 'npx prisma migrate dev' and commit the result"
fi

info "Schema-migration alignment: OK"

# 1. Check prerequisites
command -v node >/dev/null 2>&1 || fatal "node is required"
command -v pnpm >/dev/null 2>&1 || fatal "pnpm is required"
command -v docker >/dev/null 2>&1 || fatal "docker is required"

# 2. Verify lockfile is frozen
info "Verifying lockfile"
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile 2>&1 | tail -1 || fatal "Lockfile out of date — run pnpm install and commit"
else
  fatal "pnpm-lock.yaml not found"
fi

# 3. Lint all workspaces
info "Linting"
pnpm -r lint 2>&1 | tail -5 || fatal "Lint failed"

# 4. Run tests
info "Running tests"
pnpm -r test 2>&1 | tail -5 || fatal "Tests failed"

# 5. Compute env fingerprints for boot guard
info "Computing boot fingerprints"

API_FINGERPRINT=$(echo "production:${DATABASE_URL:-missing}:${REDIS_URL:-redis://redis:6379}" | sha256sum | cut -d' ' -f1)
WEB_FINGERPRINT=$(echo "production:${NEXT_PUBLIC_API_URL:-https://ayantaraz.ir/api}" | sha256sum | cut -d' ' -f1)

echo "API_ENV_FINGERPRINT=${API_FINGERPRINT}"
echo "WEB_ENV_FINGERPRINT=${WEB_FINGERPRINT}"

# 6. Dry-run migration
info "Testing migration dry-run"
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations/ 2>/dev/null)" ]; then
  npx prisma migrate deploy --dry-run --schema=prisma/schema.prisma 2>&1 | tail -3 || fatal "Migration dry-run failed"
fi

# 7. Prisma client validation
info "Validating Prisma client"
if [ -f "node_modules/.prisma/client/index.js" ]; then
  npx prisma validate --schema=prisma/schema.prisma 2>&1 | tail -1 || fatal "Prisma validation failed"
fi

# 8. Build images
VERSION="${VERSION:-$(git rev-parse --short HEAD 2>/dev/null || echo "latest")}"
info "Building images (version: ${VERSION})"

docker compose build api 2>&1 | tail -3 || fatal "API build failed"
docker compose build web 2>&1 | tail -3 || fatal "Web build failed"

# 9. Tag images
info "Tagging images"
docker tag ayantaraz-api:latest "registry.ayantaraz.ir/api:${VERSION}" 2>/dev/null || warn "Registry not configured — skipping tag"
docker tag ayantaraz-web:latest "registry.ayantaraz.ir/web:${VERSION}" 2>/dev/null || warn "Registry not configured — skipping tag"

info "Pre-deploy complete — ready for deploy"
echo "---"
echo "API fingerprint:  ${API_FINGERPRINT}"
echo "Web fingerprint:  ${WEB_FINGERPRINT}"
echo "Set these as BOOT_ENV_FINGERPRINT in docker-compose.yml or .env"
