#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "File .env not found"
    exit 1
fi
REQUIRED_VARS=("NODE_ENV" "PORT" "DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_URL" "FILE_ENCRYPTION_KEY" "SMS_API_KEY" "ADMIN_PHONE_1" "ADMIN_PHONE_2")
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
        MISSING_VARS+=("$var")
    fi
done
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "Missing variables in .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi
DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
if [[ ! "$DB_URL" =~ ^postgresql:// ]]; then
    echo "DATABASE_URL format may be incorrect: $DB_URL"
fi
JWT_SECRET=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2-)
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "JWT_SECRET must be at least 32 characters"
fi
echo "Validation successful"