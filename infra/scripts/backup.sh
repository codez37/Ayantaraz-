#!/bin/bash
set -euo pipefail

# ============================================
# Ayantaraz Database Backup Script
# ============================================
# Usage:
#   ./infra/scripts/backup.sh                   # Direct pg_dump (bare metal)
#   ./infra/scripts/backup.sh --docker          # Backup via Docker container
#   ./infra/scripts/backup.sh --list            # List available backups
#   ./infra/scripts/backup.sh --clean           # Force clean old backups
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ayantaraz}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
COMPOSE_FILE="${COMPOSE_FILE:-${SCRIPT_DIR}/docker-compose.yml}"
CONTAINER_NAME="${CONTAINER_NAME:-ayantaraz-postgres}"

RETENTION_DAYS="${RETENTION_DAYS:-7}"
RETENTION_WEEKLY="${RETENTION_WEEKLY:-4}"
RETENTION_MONTHLY="${RETENTION_MONTHLY:-3}"

MODE="${1:-}"

# ---- Functions ----
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
error() { log "ERROR: $*"; exit 1; }

list_backups() {
    echo "=== Daily Backups ==="
    find "${BACKUP_DIR}" -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -exec ls -lh {} \; 2>/dev/null | sort -k5,6 || echo "  (none)"
    echo ""
    echo "=== Weekly Backups ==="
    find "${BACKUP_DIR}" -maxdepth 1 -name "weekly_*.sql.gz" -exec ls -lh {} \; 2>/dev/null | sort -k5,6 || echo "  (none)"
    echo ""
    echo "=== Monthly Backups ==="
    find "${BACKUP_DIR}" -maxdepth 1 -name "monthly_*.sql.gz" -exec ls -lh {} \; 2>/dev/null | sort -k5,6 || echo "  (none)"
}

rotate_backups() {
    local backup_file="$1"

    # Daily rotation
    find "${BACKUP_DIR}" -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null

    # Weekly (Sunday = day 7)
    local weekday
    weekday=$(date +%u)
    if [ "$weekday" -eq 7 ]; then
        local weekly_file="${BACKUP_DIR}/weekly_${DB_NAME}_$(date +%Y%m%d).sql.gz"
        cp "$backup_file" "$weekly_file"
        find "${BACKUP_DIR}" -maxdepth 1 -name "weekly_*.sql.gz" -mtime +$((RETENTION_WEEKLY * 7)) -delete 2>/dev/null
        log "Weekly backup saved: ${weekly_file}"
    fi

    # Monthly (1st of month)
    local day
    day=$(date +%d)
    if [ "$day" -eq 1 ]; then
        local monthly_file="${BACKUP_DIR}/monthly_${DB_NAME}_$(date +%Y%m%d).sql.gz"
        cp "$backup_file" "$monthly_file"
        find "${BACKUP_DIR}" -maxdepth 1 -name "monthly_*.sql.gz" -mtime +$((RETENTION_MONTHLY * 30)) -delete 2>/dev/null
        log "Monthly backup saved: ${monthly_file}"
    fi

    log "Backup rotation completed (daily: ${RETENTION_DAYS}d, weekly: ${RETENTION_WEEKLY}w, monthly: ${RETENTION_MONTHLY}m)"
}

backup_direct() {
    [ -n "$DB_PASSWORD" ] || error "DB_PASSWORD is required for direct backup"

    local date_str
    date_str=$(date +%Y%m%d_%H%M%S)
    local filename="${BACKUP_DIR}/${DB_NAME}_${date_str}.sql.gz"

    mkdir -p "$BACKUP_DIR"
    log "Starting direct backup: ${DB_HOST}:${DB_PORT}/${DB_NAME} -> ${filename}"

    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "$filename"

    local file_size
    file_size=$(du -h "$filename" | cut -f1)
    log "Backup complete: ${file_size}"

    rotate_backups "$filename"
}

backup_docker() {
    # Try to get DB credentials from docker-compose
    local docker_user="${DB_USER}"
    local docker_db="${DB_NAME}"
    local docker_password="${DB_PASSWORD}"

    # Fall back to docker-compose env vars if available
    if command -v docker &>/dev/null; then
        docker_user=$(docker compose -f "$COMPOSE_FILE" exec -T postgres printenv POSTGRES_USER 2>/dev/null || echo "$DB_USER")
        docker_db=$(docker compose -f "$COMPOSE_FILE" exec -T postgres printenv POSTGRES_DB 2>/dev/null || echo "$DB_NAME")
    fi

    local date_str
    date_str=$(date +%Y%m%d_%H%M%S)
    local filename="${BACKUP_DIR}/${DB_NAME}_${date_str}.sql.gz"

    mkdir -p "$BACKUP_DIR"
    log "Starting Docker backup: ${CONTAINER_NAME} -> ${filename}"

    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        pg_dump \
        -U "$docker_user" \
        -d "$docker_db" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "$filename"

    local file_size
    file_size=$(du -h "$filename" | cut -f1)
    log "Backup complete: ${file_size}"

    rotate_backups "$filename"
}

# ---- Main ----
mkdir -p "$BACKUP_DIR"

case "$MODE" in
    --list|-l)
        list_backups
        exit 0
        ;;
    --clean|-c)
        log "Force cleaning backups older than retention..."
        find "${BACKUP_DIR}" -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
        find "${BACKUP_DIR}" -maxdepth 1 -name "weekly_*.sql.gz" -mtime +$((RETENTION_WEEKLY * 7)) -delete
        find "${BACKUP_DIR}" -maxdepth 1 -name "monthly_*.sql.gz" -mtime +$((RETENTION_MONTHLY * 30)) -delete
        log "Clean completed"
        exit 0
        ;;
    --docker|-d)
        backup_docker
        ;;
    --help|-h)
        echo "Ayantaraz Database Backup Script"
        echo ""
        echo "Usage:"
        echo "  $0                  Direct pg_dump (requires DB env vars)"
        echo "  $0 --docker         Backup via Docker container"
        echo "  $0 --list           List available backups"
        echo "  $0 --clean          Force clean old backups"
        echo "  $0 --help           Show this help"
        exit 0
        ;;
    "")
        backup_direct
        ;;
    *)
        error "Unknown option: ${MODE}. Use --help for usage."
        ;;
esac
