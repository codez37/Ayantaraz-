#!/usr/bin/env bash
# ============================================
# Ayantaraz Environment Setup Script
# Creates and configures .env file
# Usage: ./scripts/setup-env.sh [production|staging|development]
# ============================================
set -euo pipefail

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ========== INITIALIZATION ==========
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$PROJECT_DIR/.env.example"
ENV_TYPE="${1:-production}"

echo "=========================================="
echo "Ayantaraz Environment Setup"
echo "=========================================="
echo ""

# Validate environment type
if [[ ! "$ENV_TYPE" =~ ^(production|staging|development)$ ]]; then
    echo "Usage: $0 {production|staging|development}"
    exit 1
fi

ok "Setting up environment for: ${ENV_TYPE}"

# ========== CREATE .env FROM TEMPLATE ==========
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        ok "Created .env from .env.example"
    else
        fail ".env.example not found - cannot create .env"
    fi
else
    ok "Using existing .env file"
fi

# ========== GENERATE SECURE SECRETS ==========
gen_secret() {
    # Generate cryptographically secure random secret
    # 32 characters, base64 encoded, URL-safe
    openssl rand -base64 32 | tr -d '/+=' | cut -c1-32
}

# ========== SET ENVIRONMENT-SPECIFIC DEFAULTS ==========
case "$ENV_TYPE" in
    production)
        NODE_ENV="production"
        PORT="3001"
        FRONTEND_PORT="3000"
        SERVER_PORT="3001"
        LOG_LEVEL="info"
        ;;

    staging)
        NODE_ENV="staging"
        PORT="3001"
        FRONTEND_PORT="3000"
        SERVER_PORT="3001"
        LOG_LEVEL="debug"
        ;;

    development)
        NODE_ENV="development"
        PORT="3001"
        FRONTEND_PORT="3000"
        SERVER_PORT="3001"
        LOG_LEVEL="debug"
        ;;
esac

# ========== UPDATE OR ADD ENVIRONMENT VARIABLES ==========
# Function to safely update or add a variable in .env
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local comment="$3"

    # Check if variable exists (not commented out)
    if grep -q "^[^#]*${var_name}=" "$ENV_FILE" 2>/dev/null; then
        # Update existing variable
        sed -i "s|^[^#]*${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
    else
        # Add new variable
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
    fi

    [ -z "$comment" ] || echo "# ${comment}" >> "$ENV_FILE"
}

# ========== SET CORE CONFIGURATION ==========
ok "Setting core configuration..."

update_env_var "NODE_ENV" "$NODE_ENV" "Application environment"
update_env_var "PORT" "$PORT" "API server port"
update_env_var "SERVER_PORT" "$SERVER_PORT" "Server port for external access"
update_env_var "LOG_LEVEL" "$LOG_LEVEL" "Logging level"

# ========== SET DATABASE CONFIGURATION ==========
ok "Setting database configuration..."

# Only set defaults if not already configured
if ! grep -q "^[^#]*DATABASE_URL=" "$ENV_FILE" 2>/dev/null; then
    update_env_var "DATABASE_URL" "postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}?schema=public" "Database connection URL"
fi

if ! grep -q "^[^#]*POSTGRES_USER=" "$ENV_FILE" 2>/dev/null; then
    update_env_var "POSTGRES_USER" "ayantaraz" "PostgreSQL username"
fi

if ! grep -q "^[^#]*POSTGRES_DB=" "$ENV_FILE" 2>/dev/null; then
    update_env_var "POSTGRES_DB" "ayantaraz" "PostgreSQL database name"
fi

# Generate PostgreSQL password if not set
if ! grep -q "^[^#]*POSTGRES_PASSWORD=" "$ENV_FILE" 2>/dev/null; then
    POSTGRES_PASSWORD=$(gen_secret)
    update_env_var "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD" "PostgreSQL password (auto-generated)"
    ok "Generated PostgreSQL password"
fi

# ========== SET REDIS CONFIGURATION ==========
ok "Setting Redis configuration..."

if ! grep -q "^[^#]*REDIS_URL=" "$ENV_FILE" 2>/dev/null; then
    update_env_var "REDIS_URL" "redis://:\${REDIS_PASSWORD}@redis:6379" "Redis connection URL"
fi

# Generate Redis password if not set
if ! grep -q "^[^#]*REDIS_PASSWORD=" "$ENV_FILE" 2>/dev/null; then
    REDIS_PASSWORD=$(gen_secret)
    update_env_var "REDIS_PASSWORD" "$REDIS_PASSWORD" "Redis password (auto-generated)"
    ok "Generated Redis password"
fi

# ========== SET APPLICATION SECRETS ==========
ok "Setting application secrets..."

# Generate JWT secrets if not set
if ! grep -q "^[^#]*JWT_SECRET=" "$ENV_FILE" 2>/dev/null; then
    JWT_SECRET=$(gen_secret)
    update_env_var "JWT_SECRET" "$JWT_SECRET" "JWT secret key (auto-generated)"
    ok "Generated JWT secret"
fi

if ! grep -q "^[^#]*JWT_REFRESH_SECRET=" "$ENV_FILE" 2>/dev/null; then
    JWT_REFRESH_SECRET=$(gen_secret)
    update_env_var "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "JWT refresh secret (auto-generated)"
    ok "Generated JWT refresh secret"
fi

if ! grep -q "^[^#]*SESSION_SECRET=" "$ENV_FILE" 2>/dev/null; then
    SESSION_SECRET=$(gen_secret)
    update_env_var "SESSION_SECRET" "$SESSION_SECRET" "Session secret (auto-generated)"
    ok "Generated session secret"
fi

if ! grep -q "^[^#]*FILE_ENCRYPTION_KEY=" "$ENV_FILE" 2>/dev/null; then
    FILE_ENCRYPTION_KEY=$(gen_secret)
    update_env_var "FILE_ENCRYPTION_KEY" "$FILE_ENCRYPTION_KEY" "File encryption key (auto-generated)"
    ok "Generated file encryption key"
fi

# ========== SET URL CONFIGURATION ==========
ok "Setting URL configuration..."

HOST="${HOST:-localhost}"
API_URL="http://${HOST}:${PORT}/api"
FRONTEND_URL="http://${HOST}:${FRONTEND_PORT}"
SITE_URL="http://${HOST}"

update_env_var "API_URL" "$API_URL" "API base URL"
update_env_var "FRONTEND_URL" "$FRONTEND_URL" "Frontend base URL"
update_env_var "SITE_URL" "$SITE_URL" "Site base URL"
update_env_var "CORS_ORIGINS" "$FRONTEND_URL" "Allowed CORS origins"
update_env_var "NEXT_PUBLIC_API_URL" "$API_URL" "Public API URL for frontend"

# ========== SET SERVER CONFIGURATION ==========
ok "Setting server configuration..."

# Server IP - must be set for production
if [ "$ENV_TYPE" = "production" ] || [ "$ENV_TYPE" = "staging" ]; then
    if ! grep -q "^[^#]*SERVER_IP=" "$ENV_FILE" 2>/dev/null; then
        warn "SERVER_IP is required for ${ENV_TYPE} environment"
        warn "Please edit $ENV_FILE and set SERVER_IP to your server's IP address"
    fi
fi

# ========== SET ADMIN CONFIGURATION ==========
ok "Setting admin configuration..."

if ! grep -q "^[^#]*ADMIN_PHONE=" "$ENV_FILE" 2>/dev/null; then
    warn "ADMIN_PHONE is not set - no admin users will be created during deployment"
    warn "Set ADMIN_PHONE in $ENV_FILE to create admin users"
    update_env_var "ADMIN_PHONE" "" "Admin phone numbers (comma-separated)"
fi

# ========== SET SMS CONFIGURATION ==========
ok "Setting SMS configuration..."

if ! grep -q "^[^#]*SMS_API_KEY=" "$ENV_FILE" 2>/dev/null; then
    update_env_var "SMS_API_KEY" "your_sms_api_key_here" "SMS API key for OTP"
    warn "SMS_API_KEY is set to placeholder - OTP will not work"
    warn "Set a valid SMS_API_KEY in $ENV_FILE for OTP functionality"
fi

# ========== SET RATE LIMITING ==========
ok "Setting rate limiting..."

update_env_var "RATE_LIMIT_TTL" "60000" "Rate limit time window (ms)"
update_env_var "RATE_LIMIT" "100" "Maximum requests per window"

# ========== SET HEALTH CHECK ==========
ok "Setting health check configuration..."

update_env_var "HEALTH_CHECK_INTERVAL" "30000" "Health check interval (ms)"
update_env_var "HEALTH_URL" "${API_URL}/health" "Health check endpoint"

# ========== VALIDATE ENVIRONMENT ==========
echo ""
ok "Validating environment configuration..."

# Run the validation script
if [ -f "$PROJECT_DIR/scripts/validate-env.sh" ]; then
    if "$PROJECT_DIR/scripts/validate-env.sh"; then
        ok "Environment validation passed"
    else
        warn "Environment validation failed - check the errors above"
    fi
else
    warn "validate-env.sh not found - skipping validation"
fi

# ========== COMPLETION ==========
echo ""
echo "=========================================="
ok "Environment setup complete for ${ENV_TYPE}"
echo "=========================================="
echo ""
echo "Environment file: $ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Edit $ENV_FILE to customize configuration"
echo "  2. Set SERVER_IP for production/staging"
echo "  3. Set SMS_API_KEY for OTP functionality"
echo "  4. Run 'docker compose up --build' or './deploy/deploy.sh'"
echo ""
echo "Generated secrets have been saved to $ENV_FILE"
echo "Keep this file secure and do not commit it to version control!"
