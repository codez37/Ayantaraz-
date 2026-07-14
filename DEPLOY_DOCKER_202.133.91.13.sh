#!/bin/bash

# Ayantaraz - Professional Docker Deployment Script for Server 202.133.91.13
# Version: 2.0 - 100% Docker-based, Production Ready

set -e

SERVER_IP="202.133.91.13"
REPO_URL="https://github.com/codez37/Ayantaraz-"
REPO_DIR="/opt/ayantaraz"

log_info() { echo "[INFO] $1"; }
log_success() { echo "[SUCCESS] $1"; }
log_error() { echo "[ERROR] $1"; }

check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

install_docker() {
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        apt-get update -qq
        apt-get install -y -qq apt-transport-https ca-certificates curl gnupg lsb-release
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
        systemctl enable docker && systemctl start docker
        log_success "Docker installed"
    else
        log_success "Docker already installed"
    fi
}

clone_repository() {
    if [ -d "$REPO_DIR/.git" ]; then
        cd "$REPO_DIR" && git pull origin main
        log_success "Repository updated"
    else
        git clone --depth 1 $REPO_URL "$REPO_DIR"
        cd "$REPO_DIR"
        log_success "Repository cloned"
    fi
}

create_directories() {
    cd "$REPO_DIR"
    mkdir -p uploads prisma scripts logs
    chmod -R 777 uploads
    log_success "Directories created"
}

create_env_files() {
    cd "$REPO_DIR"
    cat > .env << ENVEOF
NODE_ENV=production
PORT=3001
API_URL=http://202.133.91.13:3001
FRONTEND_URL=http://202.133.91.13:3000
DATABASE_URL=postgresql://ayantaraz:ayantaraz2024@db:5432/ayantaraz?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=ayantaraz-production-secret-key-2024-change-me
JWT_REFRESH_SECRET=ayantaraz-production-refresh-secret-2024-change-me
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
FILE_ENCRYPTION_KEY=ayantaraz-file-encryption-key-32-chars-2024
CAPTCHA_SECRET=
ALLOW_ALL_ORIGINS=true
TRUSTED_ORIGINS=http://202.133.91.13,http://202.133.91.13:3000,http://202.133.91.13:3001
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=
DB_POOL_MAX_CONNECTIONS=20
DB_POOL_MIN_CONNECTIONS=5
DB_POOL_MAX_REQUESTS_PER_CONNECTION=100
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_POOL_CONNECTION_TIMEOUT_MS=5000
DOCKER_ENV=true
LOG_LEVEL=info
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/json
ENVEOF
    cp .env .env.example
    log_success ".env created for 202.133.91.13"
}

create_seed_script() {
    cd "$REPO_DIR"
    cat > scripts/seed-admin.js << 'SEEDEOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ADMIN_PHONES = ['09133374162', '09134292329'];
async function main() {
  console.log('Seeding admin users for server 202.133.91.13...');
  for (const phone of ADMIN_PHONES) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      if (existing.role !== 'admin') {
        await prisma.user.update({ where: { id: existing.id }, data: { role: 'admin', isActive: true } });
        console.log('Updated ' + phone + ' to admin');
      } else {
        console.log(phone + ' is already admin');
      }
    } else {
      await prisma.user.create({ data: { phone, role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User' } });
      console.log('Created admin: ' + phone);
    }
  }
  console.log('Admin users seeded successfully!');
  ADMIN_PHONES.forEach(function(p) { console.log('  - ' + p); });
  await prisma.$disconnect();
}
main().catch(function(e) { console.error('Error:', e); process.exit(1); });
SEEDEOF
    chmod +x scripts/seed-admin.js
    log_success "Admin seed script created"
}

build_and_start() {
    cd "$REPO_DIR"
    log_info "Building containers..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    log_info "Starting containers..."
    docker-compose -f docker-compose.prod.yml up -d
    sleep 30
    log_info "Running migrations..."
    docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate deploy
    log_info "Seeding admins..."
    docker-compose -f docker-compose.prod.yml exec api node scripts/seed-admin.js
    log_success "All containers running"
}

verify_deployment() {
    cd "$REPO_DIR"
    local max_retries=30
    local retry_count=0
    while [ $retry_count -lt $max_retries ]; do
        if curl -s http://localhost:3001/health/ping > /dev/null; then
            log_success "API is healthy"
            return 0
        fi
        retry_count=$((retry_count + 1))
        sleep 5
    done
    log_error "API health check failed"
    exit 1
}

display_final_info() {
    echo ""
    echo "=============================================="
    echo "  DEPLOYMENT COMPLETE!"
    echo "=============================================="
    echo ""
    echo "Server: 202.133.91.13"
    echo "API URL: http://202.133.91.13:3001/api"
    echo "Health: http://202.133.91.13:3001/health"
    echo ""
    echo "Admin Phone Numbers:"
    echo "   - 09133374162"
    echo "   - 09134292329"
    echo ""
    echo "Management:"
    echo "   Stop:   docker-compose -f docker-compose.prod.yml down"
    echo "   Start:  docker-compose -f docker-compose.prod.yml up -d"
    echo "   Logs:   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "Configuration:"
    echo "   - CAPTCHA: DISABLED"
    echo "   - CORS: All origins allowed"
    echo "   - Docker-based: YES"
    echo "   - pnpm: YES"
    echo ""
}

main() {
    check_root
    install_docker
    clone_repository
    create_directories
    create_env_files
    create_seed_script
    build_and_start
    verify_deployment
    display_final_info
}

main
