#!/usr/bin/env bash
set -uo pipefail
DEPLOY_USER="ayan"; DEPLOY_DIR="/opt/ayan-taraz"; LOCK_DIR="/var/lock/ayan-deploy"
ENV_DIR="${DEPLOY_DIR}/env"; STATE_DIR="${DEPLOY_DIR}/state"
SIGNING_KEY="${STATE_DIR}/deploy.key"; PREV_KEY="${STATE_DIR}/deploy.key.prev"
log() { echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"; }

log "[A] apt-get update"; apt-get update -y
log "[B] Dependencies"
for pkg in ca-certificates curl gnupg lsb-release wget git htop net-tools ufw jq sudo util-linux; do
  dpkg -s "$pkg" &>/dev/null || apt-get install -y "$pkg"
done
log "[C] Docker"
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y; apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker; systemctl start docker
fi
log "[D] User"; id "${DEPLOY_USER}" &>/dev/null || { useradd -m -s /bin/bash "${DEPLOY_USER}"; usermod -aG docker "${DEPLOY_USER}"; }
log "[E] Sudoers"
cat > /etc/sudoers.d/${DEPLOY_USER} << 'SUDOCFG'
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml up -d
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml down
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml pull
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml ps
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml logs *
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml stop nginx
ayan ALL=(ALL) NOPASSWD: /usr/bin/docker compose -f /opt/ayan-taraz/current/docker-compose.yml start nginx
ayan ALL=(ALL) NOPASSWD: /bin/ln -snf /opt/ayan-taraz/releases/* /opt/ayan-taraz/current
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy lock
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy release *
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy gate *
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy activate *
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy pass
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy rollback
ayan ALL=(ALL) NOPASSWD: /usr/local/bin/ayan-deploy health
SUDOCFG
chmod 440 /etc/sudoers.d/${DEPLOY_USER}
log "[F] Firewall"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
fi
log "[G] Directories"
mkdir -p "${DEPLOY_DIR}/releases" "${ENV_DIR}" "${DEPLOY_DIR}/shared" "${DEPLOY_DIR}/uploads" "${LOCK_DIR}" "${STATE_DIR}"
chmod 755 "${DEPLOY_DIR}" "${DEPLOY_DIR}/uploads" "${STATE_DIR}"
chown -R ${DEPLOY_USER}:${DEPLOY_USER} "${DEPLOY_DIR}"; chown -R ${DEPLOY_USER}:${DEPLOY_USER} "${LOCK_DIR}"
touch "${STATE_DIR}/events.log"; chmod 644 "${STATE_DIR}/events.log"
log "[H] Signing key"
if [ ! -f "${SIGNING_KEY}" ]; then openssl rand -hex 32 > "${SIGNING_KEY}"; chmod 600 "${SIGNING_KEY}"; chown root:root "${SIGNING_KEY}"; fi
log "[I] Deploy helper"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_AYAN_DEPLOY="$(mktemp)"
cat "${SCRIPT_DIR}/helper-part1.sh" "${SCRIPT_DIR}/helper-part2.sh" "${SCRIPT_DIR}/helper-part3.sh" "${SCRIPT_DIR}/helper-part4.sh" > "${TEMP_AYAN_DEPLOY}"
if [ -s "${TEMP_AYAN_DEPLOY}" ]; then
  mv "${TEMP_AYAN_DEPLOY}" /usr/local/bin/ayan-deploy
  chmod +x /usr/local/bin/ayan-deploy
  log "   Deploy helper created"
else
  log "   ERROR: Deploy helper creation failed"
  return 1
fi
log "[J] Environment"
if [ ! -f "${ENV_DIR}/current.env" ] && [ ! -L "${ENV_DIR}/current.env" ]; then
  JWT_SECRET=$(openssl rand -base64 48)
  JWT_REFRESH_SECRET=$(openssl rand -base64 48)
  DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
  REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
  TS=$(date -u +"%Y%m%d_%H%M%S")
  cat > "${ENV_DIR}/${TS}.env" << ENV_EOF
DATABASE_URL=postgresql://ayantaraz:${DB_PASSWORD}@postgres:5432/ayantaraz?schema=public&connection_limit=20&pool_timeout=10&statement_timeout=30000&idle_timeout=60
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
SMS_API_KEY=CHANGE_ME_TO_REAL_S_API_IR_KEY
APP_URL=http://change_me_to_your_server_ip
  API_URL=http://change_me_to_your_server_ip/api
  NODE_ENV=production
  LOG_LEVEL=warn
  CORS_ORIGINS=http://change_me_to_your_server_ip
  ADMIN_PHONE=09120000000
  POSTGRES_DB=ayantaraz
  POSTGRES_USER=ayantaraz
  POSTGRES_PASSWORD=${DB_PASSWORD}
  TZ=Asia/Tehran
  COOKIE_SECURE=false
  NEXT_PUBLIC_API_URL=http://change_me_to_your_server_ip/api
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_LIMIT=3
OTP_RESEND_WINDOW_MINUTES=10
OTP_BLOCK_DURATION_MINUTES=30
ENV_EOF
  chmod 600 "${ENV_DIR}/${TS}.env"; chown root:root "${ENV_DIR}/${TS}.env"
  ln -sf "${ENV_DIR}/${TS}.env" "${ENV_DIR}/current.env"
else
  log "   .env exists."
  # Fix missing REDIS_PASSWORD in existing .env
  ENV_CURRENT="${ENV_DIR}/current.env"
  if [ -L "${ENV_CURRENT}" ]; then ENV_CURRENT="$(readlink -f "${ENV_CURRENT}")"; fi
  if [ -f "${ENV_CURRENT}" ] && ! grep -q '^REDIS_PASSWORD=' "${ENV_CURRENT}"; then
    RP=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
    echo "REDIS_PASSWORD=${RP}" >> "${ENV_CURRENT}"
    chmod 600 "${ENV_CURRENT}"; chown root:root "${ENV_CURRENT}"
    log "   Added REDIS_PASSWORD to existing .env"
  fi
fi
if [ ! -f "${STATE_DIR}/machine.state" ]; then
  cat > "${STATE_DIR}/machine.state" << STATE_EOF
STATE=IDLE
STATE_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
STATE_VER=
TRACE_ID=
STATE_EOF
  chmod 644 "${STATE_DIR}/machine.state"
fi
[ -f "${STATE_DIR}/event_seq" ] || echo "0">"${STATE_DIR}/event_seq"
[ -f "${STATE_DIR}/generation" ] || echo "0">"${STATE_DIR}/generation"
log "============================================"
log " Bootstrap Complete!"
log "============================================"
log " Next: Set SMS_API_KEY in ${ENV_DIR}/current.env"
log " Then: ayan-deploy lock && ayan-deploy release 20260627 && ayan-deploy gate 20260627 && ayan-deploy activate 20260627 && ayan-deploy pass"
