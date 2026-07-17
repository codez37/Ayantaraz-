#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "$ENV_FILE")

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
fail() { printf '[FATAL] %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "$1 is required"; }
wait_healthy() {
  local service="$1" attempts="${2:-60}" status=""
  for _ in $(seq 1 "$attempts"); do
    status="$("${COMPOSE[@]}" ps --format json "$service" 2>/dev/null | sed -n 's/.*"Health":"\([^"]*\)".*/\1/p' | head -1)"
    [ "$status" = healthy ] && { log "$service is healthy"; return 0; }
    sleep 2
  done
  "${COMPOSE[@]}" logs --tail=80 "$service" >&2 || true
  fail "$service did not become healthy (last status: ${status:-unknown})"
}

need docker
need curl
[ -f "$ENV_FILE" ] || fail "$ENV_FILE not found; run scripts/env.sh create first"
scripts/env.sh validate

docker info >/dev/null 2>&1 || fail "Docker daemon is not reachable"
log "Validating Compose configuration"
"${COMPOSE[@]}" config >/tmp/ayantaraz-compose.yml

log "Building production images"
"${COMPOSE[@]}" build api web

log "Starting stateful services"
"${COMPOSE[@]}" up -d db redis
wait_healthy db 60
wait_healthy redis 60

log "Running database migrations inside API image"
"${COMPOSE[@]}" run --rm --no-deps --entrypoint /app/node_modules/.bin/prisma api migrate deploy --schema=/app/prisma/schema.prisma

log "Starting application services"
"${COMPOSE[@]}" up -d --remove-orphans api web nginx
wait_healthy api 60
wait_healthy web 60
wait_healthy nginx 60

log "Checking public endpoints"
curl -fsS http://127.0.0.1/health >/dev/null
curl -fsS http://127.0.0.1/api/health >/dev/null

log "Deployment completed successfully"
"${COMPOSE[@]}" ps
