#!/usr/bin/env bash
# ============================================================
# Ayantaraz Pre-Deploy Validation Script
# Hardened Version - No Hardcoded Values
# Usage: ./scripts/pre-deploy.sh
# ============================================================
set -euo pipefail

# Logging functions with timestamps
info()  { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [INFO]  $1"; }
warn()  { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [WARN]  $1"; }
fatal() { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [FATAL] $1"; exit 1; }

echo "=========================================="
echo "Ayantaraz Pre-Deploy Validation"
echo "=========================================="
echo ""

# ========== 0. Schema-Migration Alignment Guard ==========
info "Checking schema-migration alignment"

BASE_BRANCH="${CI_BASE_BRANCH:-origin/main}"
CURRENT_BRANCH="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null)}"

# Check if schema has changed
SCHEMA_CHANGED=false
if git diff --name-only "${BASE_BRANCH}...HEAD" 2>/dev/null | grep -q "prisma/schema.prisma"; then
    SCHEMA_CHANGED=true
fi

# Check if migrations exist
MIGRATION_EXISTS=false
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    MIGRATION_EXISTS=true
fi

# Fail fast if schema changed but no migrations
if [ "$SCHEMA_CHANGED" = true ] && [ "$MIGRATION_EXISTS" = false ]; then
    fatal "schema.prisma has changed but no migration artifacts exist"
    fatal "Run 'npx prisma migrate dev' locally and commit the migration files"
fi

info "Schema-migration alignment: OK"

# ========== 1. Prerequisites Check ==========
info "Checking prerequisites"

command -v node >/dev/null 2>&1 || fatal "Node.js is required but not found"
command -v pnpm >/dev/null 2>&1 || fatal "pnpm is required but not found"
command -v docker >/dev/null 2>&1 || fatal "Docker is required but not found"
command -v git >/dev/null 2>&1 || fatal "Git is required but not found"

ok "All prerequisites are available"

# ========== 2. Lockfile Validation ==========
info "Verifying pnpm lockfile integrity"

if [ ! -f "pnpm-lock.yaml" ]; then
    fatal "pnpm-lock.yaml not found"
fi

if ! pnpm install --frozen-lockfile >/dev/null 2>&1; then
    fatal "Lockfile is out of date - run 'pnpm install' and commit the changes"
fi

info "Lockfile validation: OK"

# ========== 3. Linting ==========
info "Running lint checks"

if ! pnpm -r lint >/dev/null 2>&1; then
    fatal "Linting failed - fix lint errors before deployment"
fi

info "Linting: OK"

# ========== 4. Tests ==========
info "Running tests"

if ! pnpm -r test >/dev/null 2>&1; then
    fatal "Tests failed - fix test failures before deployment"
fi

info "Tests: OK"

# ========== 5. Environment Fingerprints (Boot Guard) ==========
info "Computing environment fingerprints"

# Use environment variables or safe defaults
DB_URL="${DATABASE_URL:-postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}?schema=public}"
REDIS_URL_VAL="${REDIS_URL:-redis://:\${REDIS_PASSWORD}@redis:6379}"
API_URL_VAL="${NEXT_PUBLIC_API_URL:-http://localhost:3001/api}"

API_FINGERPRINT=$(echo "production:${DB_URL}:${REDIS_URL_VAL}" | sha256sum | cut -d' ' -f1)
WEB_FINGERPRINT=$(echo "production:${API_URL_VAL}" | sha256sum | cut -d' ' -f1)

echo "API_ENV_FINGERPRINT=${API_FINGERPRINT}"
echo "WEB_ENV_FINGERPRINT=${WEB_FINGERPRINT}"

# ========== 6. Migration Dry-Run ==========
info "Testing migration dry-run"

if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations/ 2>/dev/null)" ]; then
    if ! npx prisma migrate deploy --dry-run --schema=prisma/schema.prisma >/dev/null 2>&1; then
        fatal "Migration dry-run failed - check your migration files"
    fi
    info "Migration dry-run: OK"
else
    warn "No migrations found - skipping dry-run test"
fi

# ========== 7. Prisma Client Validation ==========
info "Validating Prisma client"

if [ -f "node_modules/.prisma/client/index.js" ]; then
    if ! npx prisma validate --schema=prisma/schema.prisma >/dev/null 2>&1; then
        fatal "Prisma schema validation failed"
    fi
    info "Prisma validation: OK"
else
    warn "Prisma client not generated - run 'npx prisma generate' first"
fi

# ========== 8. Build Docker Images ==========
info "Building Docker images"

VERSION="${VERSION:-$(git rev-parse --short HEAD 2>/dev/null || echo "latest")}"
info "Building version: ${VERSION}"

# Build API image
if ! docker compose build api >/dev/null 2>&1; then
    fatal "API Docker image build failed"
fi
info "API image built successfully"

# Build Web image
if ! docker compose build web >/dev/null 2>&1; then
    fatal "Web Docker image build failed"
fi
info "Web image built successfully"

# ========== 9. Tag Images (Optional) ==========
info "Tagging Docker images"

REGISTRY="${REGISTRY:-ghcr.io}"
ORGANIZATION="${ORGANIZATION:-codez37}"
API_IMAGE="${API_IMAGE:-${REGISTRY}/${ORGANIZATION}/ayantaraz-api}"
WEB_IMAGE="${WEB_IMAGE:-${REGISTRY}/${ORGANIZATION}/ayantaraz-web}"

# Only tag if registry login is available
if docker info >/dev/null 2>&1; then
    docker tag ayantaraz-api:latest "${API_IMAGE}:${VERSION}" 2>/dev/null || \
        warn "Failed to tag API image - registry may not be configured"
    docker tag ayantaraz-web:latest "${WEB_IMAGE}:${VERSION}" 2>/dev/null || \
        warn "Failed to tag Web image - registry may not be configured"
else
    warn "Docker registry not available - skipping image tagging"
fi

# ========== COMPLETION ==========
echo ""
info "=========================================="
info "Pre-deploy validation complete"
info "=========================================="
echo ""
echo "Environment Fingerprints:"
echo "  API:  ${API_FINGERPRINT}"
echo "  Web:  ${WEB_FINGERPRINT}"
echo ""
echo "To use these fingerprints, set them as environment variables:"
echo "  BOOT_ENV_FINGERPRINT=${API_FINGERPRINT}"
echo ""
info "Ready for deployment"
