#!/usr/bin/env bash
# ============================================
# Ayantaraz Environment Validation Script
# Hardened Version - Strict validation
# Usage: ./scripts/validate-env.sh [.env_file]
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${1:-$PROJECT_DIR/.env}"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo "Validating environment configuration..."
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    fail "Environment file not found: $ENV_FILE"
fi

ok "Environment file found: $ENV_FILE"

# ========== REQUIRED VARIABLES ==========
REQUIRED_VARS=(
    "NODE_ENV"
    "PORT"
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "REDIS_URL"
    "FILE_ENCRYPTION_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^[^#]*${var}=" "$ENV_FILE" 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    fail "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    exit 1
fi

ok "All required variables are present"

# ========== VARIABLE TYPE VALIDATION ==========
echo ""
echo "--- Validating variable types ---"

# NODE_ENV must be production, staging, or development
NODE_ENV_VALUE=$(grep "^[^#]*NODE_ENV=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
if [[ ! "$NODE_ENV_VALUE" =~ ^(production|staging|development)$ ]]; then
    fail "NODE_ENV must be 'production', 'staging', or 'development', got: $NODE_ENV_VALUE"
fi
ok "NODE_ENV = ${NODE_ENV_VALUE}"

# PORT must be a number
PORT_VALUE=$(grep "^[^#]*PORT=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
if ! [[ "$PORT_VALUE" =~ ^[0-9]+$ ]]; then
    fail "PORT must be a number, got: $PORT_VALUE"
fi
ok "PORT = ${PORT_VALUE}"

# JWT_SECRET must be at least 32 characters
JWT_SECRET_VALUE=$(grep "^[^#]*JWT_SECRET=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
if [ ${#JWT_SECRET_VALUE} -lt 32 ]; then
    fail "JWT_SECRET must be at least 32 characters long (current: ${#JWT_SECRET_VALUE})"
fi
ok "JWT_SECRET length: ${#JWT_SECRET_VALUE} characters"

# JWT_REFRESH_SECRET must be at least 32 characters
JWT_REFRESH_SECRET_VALUE=$(grep "^[^#]*JWT_REFRESH_SECRET=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
if [ ${#JWT_REFRESH_SECRET_VALUE} -lt 32 ]; then
    fail "JWT_REFRESH_SECRET must be at least 32 characters long (current: ${#JWT_REFRESH_SECRET_VALUE})"
fi
ok "JWT_REFRESH_SECRET length: ${#JWT_REFRESH_SECRET_VALUE} characters"

# FILE_ENCRYPTION_KEY must be at least 32 characters
FILE_ENCRYPTION_KEY_VALUE=$(grep "^[^#]*FILE_ENCRYPTION_KEY=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
if [ ${#FILE_ENCRYPTION_KEY_VALUE} -lt 32 ]; then
    fail "FILE_ENCRYPTION_KEY must be at least 32 characters long (current: ${#FILE_ENCRYPTION_KEY_VALUE})"
fi
ok "FILE_ENCRYPTION_KEY length: ${#FILE_ENCRYPTION_KEY_VALUE} characters"

# ========== DATABASE URL VALIDATION ==========
echo ""
echo "--- Validating Database Configuration ---"

DATABASE_URL_VALUE=$(grep "^[^#]*DATABASE_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')

if [[ ! "$DATABASE_URL_VALUE" =~ ^postgresql:// ]]; then
    fail "DATABASE_URL must start with 'postgresql://', got: $DATABASE_URL_VALUE"
fi
ok "DATABASE_URL format: valid PostgreSQL URL"

# Check if DATABASE_URL contains password
if [[ ! "$DATABASE_URL_VALUE" =~ ://[^:]+:[^@]+@ ]]; then
    warn "DATABASE_URL may be missing password: $DATABASE_URL_VALUE"
fi

# ========== REDIS URL VALIDATION ==========
echo ""
echo "--- Validating Redis Configuration ---"

REDIS_URL_VALUE=$(grep "^[^#]*REDIS_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')

if [[ ! "$REDIS_URL_VALUE" =~ ^redis:// ]]; then
    fail "REDIS_URL must start with 'redis://', got: $REDIS_URL_VALUE"
fi
ok "REDIS_URL format: valid Redis URL"

# ========== PRODUCTION-SPECIFIC VALIDATION ==========
echo ""
echo "--- Production-Specific Validation ---"

NODE_ENV_VALUE=$(grep "^[^#]*NODE_ENV=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')

if [ "$NODE_ENV_VALUE" = "production" ]; then
    # In production, SERVER_IP must be set
    if ! grep -q "^[^#]*SERVER_IP=" "$ENV_FILE" 2>/dev/null; then
        fail "SERVER_IP is required for production environment"
    fi

    SERVER_IP_VALUE=$(grep "^[^#]*SERVER_IP=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
    if [ "$SERVER_IP_VALUE" = "localhost" ] || [ "$SERVER_IP_VALUE" = "127.0.0.1" ]; then
        fail "SERVER_IP cannot be localhost or 127.0.0.1 in production"
    fi
    ok "SERVER_IP = ${SERVER_IP_VALUE}"

    # In production, SMS_API_KEY should be set
    if ! grep -q "^[^#]*SMS_API_KEY=" "$ENV_FILE" 2>/dev/null; then
        warn "SMS_API_KEY is not set - OTP functionality will not work in production"
    else
        SMS_API_KEY_VALUE=$(grep "^[^#]*SMS_API_KEY=" "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
        if [ "$SMS_API_KEY_VALUE" = "your_sms_api_key_here" ] || [ "$SMS_API_KEY_VALUE" = "change_me_to_your_sms_api_key" ]; then
            warn "SMS_API_KEY is using default/placeholder value - OTP will not work"
        else
            ok "SMS_API_KEY is configured"
        fi
    fi
fi

# ========== SECURITY WARNINGS ==========
echo ""
echo "--- Security Warnings ---"

# Check for default values
DEFAULT_VALUES=(
    "change_me_to_your_server_ip"
    "your_sms_api_key_here"
    "change_me_to_your_sms_api_key"
    "default_password"
    "secret"
    "password"
)

for default in "${DEFAULT_VALUES[@]}"; do
    if grep -q \"=${default}$\" "$ENV_FILE" 2>/dev/null || grep -q \"=${default}\"\" \"$ENV_FILE\" 2>/dev/null; then
        warn "Default/placeholder value detected: '$default' - this should be changed"
    fi
done

# ========== COMPLETION ==========
echo ""
echo "=========================================="
ok "Environment validation passed"
echo "=========================================="
echo ""
echo "All required variables are present and valid"
echo "The environment is ready for deployment"
