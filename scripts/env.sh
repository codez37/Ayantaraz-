#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"
EXAMPLE_FILE="${EXAMPLE_FILE:-${ROOT_DIR}/.env.example}"
MODE="${1:-validate}"

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
fail() { printf '[FATAL] %s\n' "$*" >&2; exit 1; }
rand_secret() { openssl rand -base64 48 | tr -d '\n'; }
set_env_value() {
  local key="$1" value="$2" file="$3"
  if grep -qE "^${key}=" "$file"; then
    sed -i.bak -E "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
  rm -f "${file}.bak"
}
get_env_value() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2-; }

create_env() {
  [ ! -f "$ENV_FILE" ] || fail "$ENV_FILE already exists; refusing to overwrite production secrets"
  [ -f "$EXAMPLE_FILE" ] || fail "$EXAMPLE_FILE not found"
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  chmod 600 "$ENV_FILE"

  local server_host="${SERVER_HOST:-202.133.91.13}"
  local postgres_password redis_password jwt_secret jwt_refresh_secret file_key session_secret
  postgres_password="$(rand_secret)"
  redis_password="$(rand_secret)"
  jwt_secret="$(rand_secret)"
  jwt_refresh_secret="$(rand_secret)"
  file_key="$(rand_secret)"
  session_secret="$(rand_secret)"

  set_env_value NODE_ENV production "$ENV_FILE"
  set_env_value PORT 3001 "$ENV_FILE"
  set_env_value SITE_URL "http://${server_host}" "$ENV_FILE"
  set_env_value API_URL "http://${server_host}:3001" "$ENV_FILE"
  set_env_value FRONTEND_URL "http://${server_host}:3000" "$ENV_FILE"
  set_env_value NEXT_PUBLIC_SITE_URL "http://${server_host}" "$ENV_FILE"
  set_env_value NEXT_PUBLIC_API_URL "http://${server_host}/api" "$ENV_FILE"
  set_env_value POSTGRES_USER ayantaraz "$ENV_FILE"
  set_env_value POSTGRES_PASSWORD "$postgres_password" "$ENV_FILE"
  set_env_value POSTGRES_DB ayantaraz "$ENV_FILE"
  set_env_value DATABASE_URL "postgresql://ayantaraz:${postgres_password}@db:5432/ayantaraz?schema=public" "$ENV_FILE"
  set_env_value REDIS_HOST redis "$ENV_FILE"
  set_env_value REDIS_PORT 6379 "$ENV_FILE"
  set_env_value REDIS_PASSWORD "$redis_password" "$ENV_FILE"
  set_env_value REDIS_URL "redis://:${redis_password}@redis:6379" "$ENV_FILE"
  set_env_value JWT_SECRET "$jwt_secret" "$ENV_FILE"
  set_env_value JWT_REFRESH_SECRET "$jwt_refresh_secret" "$ENV_FILE"
  set_env_value FILE_ENCRYPTION_KEY "$file_key" "$ENV_FILE"
  set_env_value SESSION_SECRET "$session_secret" "$ENV_FILE"
  set_env_value COOKIE_DOMAIN "$server_host" "$ENV_FILE"
  set_env_value TRUSTED_ORIGINS "http://${server_host},http://${server_host}:3000,http://${server_host}:3001" "$ENV_FILE"
  log "Created $ENV_FILE with generated secrets; set SMS_API_KEY before deploy."
}

validate_env() {
  [ -f "$ENV_FILE" ] || fail "$ENV_FILE not found; run: scripts/env.sh create"
  local required=(NODE_ENV PORT DATABASE_URL POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB REDIS_PASSWORD REDIS_URL JWT_SECRET JWT_REFRESH_SECRET FILE_ENCRYPTION_KEY SESSION_SECRET SMS_API_KEY NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_API_URL)
  local key value errors=0
  for key in "${required[@]}"; do
    if ! grep -qE "^${key}=.+" "$ENV_FILE"; then
      printf '[ERROR] Missing %s\n' "$key" >&2
      errors=$((errors + 1))
      continue
    fi
    value="$(get_env_value "$key")"
    if printf '%s' "$value" | grep -Eq 'CHANGE_ME|YOUR_|change_me|missing'; then
      printf '[ERROR] Placeholder value for %s\n' "$key" >&2
      errors=$((errors + 1))
    fi
  done

  [ "$(get_env_value NODE_ENV)" = production ] || { printf '[ERROR] NODE_ENV must be production\n' >&2; errors=$((errors + 1)); }
  [[ "$(get_env_value DATABASE_URL)" == postgresql://*"@db:5432/"* ]] || { printf '[ERROR] DATABASE_URL must target Compose service db:5432\n' >&2; errors=$((errors + 1)); }
  [[ "$(get_env_value REDIS_URL)" == redis://:*"@redis:6379"* ]] || { printf '[ERROR] REDIS_URL must target Compose service redis:6379\n' >&2; errors=$((errors + 1)); }
  local jwt_secret jwt_refresh_secret
  jwt_secret="$(get_env_value JWT_SECRET)"
  jwt_refresh_secret="$(get_env_value JWT_REFRESH_SECRET)"
  [ ${#jwt_secret} -ge 32 ] || { printf '[ERROR] JWT_SECRET must be at least 32 characters\n' >&2; errors=$((errors + 1)); }
  [ ${#jwt_refresh_secret} -ge 32 ] || { printf '[ERROR] JWT_REFRESH_SECRET must be at least 32 characters\n' >&2; errors=$((errors + 1)); }
  [ "$jwt_secret" != "$jwt_refresh_secret" ] || { printf '[ERROR] JWT secrets must be different\n' >&2; errors=$((errors + 1)); }

  [ "$errors" -eq 0 ] || fail "$errors environment validation error(s)"
  log "Environment validation passed: $ENV_FILE"
}

case "$MODE" in
  create) create_env ;;
  validate) validate_env ;;
  *) fail "Usage: $0 {create|validate}" ;;
esac
