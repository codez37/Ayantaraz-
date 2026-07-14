#!/bin/bash

# Ayantaraz - Complete Deployment Script for Server 202.133.91.13
# This script does EVERYTHING: installs dependencies, clones repo, creates files, configures, seeds admins, and starts
# Run this script as root: sudo bash DEPLOY_TO_202.133.91.13.sh

set -e

SERVER_IP="202.133.91.13"
echo "=============================================="
echo "  Ayantaraz - Complete Deployment for $SERVER_IP"
echo "=============================================="
echo ""

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "⚠️  Please run this script as root or with sudo"
    echo "   Some commands require root privileges"
    exit 1
fi

# Step 1: Install system dependencies
echo "[1/8] Installing system dependencies..."
apt-get update -qq > /dev/null 2>&1
apt-get install -y -qq git curl nodejs npm postgresql postgresql-contrib redis-server > /dev/null 2>&1
echo "✓ System dependencies installed"

# Step 2: Clone repository
echo ""
echo "[2/8] Cloning repository..."
REPO_DIR="/opt/ayantaraz"
if [ -d "$REPO_DIR/.git" ]; then
    cd "$REPO_DIR"
    git pull origin main
    echo "✓ Repository updated"
else
    git clone https://github.com/codez37/Ayantaraz- "$REPO_DIR"
    cd "$REPO_DIR"
    echo "✓ Repository cloned"
fi

# Step 3: Create all directories
echo ""
echo "[3/8] Creating directories..."
mkdir -p apps/api/src/prisma
mkdir -p apps/api/src/common/guards
mkdir -p apps/api/src/common/filters
mkdir -p apps/api/src/common/middleware
mkdir -p apps/api/src/common/logger
mkdir -p apps/api/src/common/interceptors
mkdir -p apps/api/src/modules/auth
mkdir -p apps/api/src/modules/security
mkdir -p apps/api/src/modules/health
mkdir -p apps/api/src/modules/users
mkdir -p apps/api/src/modules/content
mkdir -p apps/api/src/modules/upload
mkdir -p scripts
mkdir -p uploads

echo "✓ Directories created"

# Step 4: Create .env file for IP 202.133.91.13
echo ""
echo "[4/8] Creating .env file for $SERVER_IP..."
cat > .env << ENVEOF
# Application
NODE_ENV=production
PORT=3001
API_URL=http://$SERVER_IP:3001
FRONTEND_URL=http://$SERVER_IP:3000

# Database
DATABASE_URL=postgresql://ayantaraz:ayantaraz2024@localhost:5432/ayantaraz?schema=public

# JWT
JWT_SECRET=ayantaraz-production-secret-key-2024-change-me
JWT_REFRESH_SECRET=ayantaraz-production-refresh-secret-2024-change-me
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
FILE_ENCRYPTION_KEY=ayantaraz-file-encryption-key-32-chars-2024
CAPTCHA_SECRET=
ALLOW_ALL_ORIGINS=true
TRUSTED_ORIGINS=http://$SERVER_IP,http://$SERVER_IP:3000,http://$SERVER_IP:3001

# Cookie Settings (for IP/HTTP access)
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=

# Database Pool
DB_POOL_MAX_CONNECTIONS=20
DB_POOL_MIN_CONNECTIONS=5
DB_POOL_MAX_REQUESTS_PER_CONNECTION=100
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_POOL_CONNECTION_TIMEOUT_MS=5000

# Server
DOCKER_ENV=false
ENVEOF
echo "✓ .env file created for $SERVER_IP"

# Step 5: Create captcha.service.ts (DISABLED)
echo ""
echo "[5/8] Creating captcha.service.ts (DISABLED)..."
cat > apps/api/src/modules/security/captcha.service.ts << 'CAPTCHAEOF'
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  constructor() { this.logger.log('CAPTCHA validation is disabled for deployment'); }
  async validate(response: string, action?: string): Promise<boolean> { return true; }
  async validateWithScore(response: string, action: string, minScore: number = 0.5): Promise<boolean> { return true; }
}
CAPTCHAEOF
echo "✓ captcha.service.ts created (DISABLED)"

# Step 6: Create seed-admin.js with the two phone numbers
echo ""
echo "[6/8] Creating admin seed script..."
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
        console.log('✓ Updated ' + phone + ' to admin');
      } else {
        console.log('✓ ' + phone + ' is already admin');
      }
    } else {
      await prisma.user.create({ data: { phone, role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User' } });
      console.log('✓ Created admin: ' + phone);
    }
  }
  console.log('
✅ Admin users seeded successfully!');
  console.log('Admin phone numbers:');
  ADMIN_PHONES.forEach(function(p) { console.log('  - ' + p); });
  await prisma.$disconnect();
}
main().catch(function(e) { console.error('❌ Error:', e); process.exit(1); });
SEEDEOF
echo "✓ Admin seed script created with phones: 09133374162, 09134292329"

# Step 7: Create start.sh
echo ""
echo "[7/8] Creating start script..."
cat > start.sh << 'STARTEOF'
#!/bin/bash
set -e
cd /opt/ayantaraz

echo "Starting Ayantaraz API on 202.133.91.13..."
echo ""

# Run database migrations
cd apps/api
echo "[1/3] Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy
echo "✓ Migrations applied"

# Seed admin users
cd ../..
echo ""
echo "[2/3] Seeding admin users..."
node scripts/seed-admin.js
echo ""

# Start the application
echo "[3/3] Starting application..."
npm run start:prod
STARTEOF
chmod +x start.sh
echo "✓ Start script created"

# Step 8: Create stop.sh
echo ""
echo "[8/8] Creating stop script..."
cat > stop.sh << 'STOPEOF'
#!/bin/bash
PID=$(lsof -t -i:3001 2>/dev/null || pgrep -f "node.*apps/api" 2>/dev/null)
if [ -z "$PID" ]; then
    echo "No process running on port 3001"
else
    echo "Stopping process on port 3001 (PID: $PID)..."
    kill -15 $PID
    sleep 5
    if kill -0 $PID 2>/dev/null; then
        echo "Process did not stop gracefully, killing..."
        kill -9 $PID
    else
        echo "✓ Process stopped"
    fi
fi
STOPEOF
chmod +x stop.sh
echo "✓ Stop script created"

# Setup PostgreSQL
echo ""
echo "=============================================="
echo "[POST-DEPLOYMENT] PostgreSQL Setup"
echo "=============================================="
echo ""

# Create database user and database
if ! sudo -u postgres psql -lqt | cut -d | -f 1 | grep -qw "ayantaraz"; then
    echo "Creating database and user..."
    sudo -u postgres psql -c "CREATE USER ayantaraz WITH PASSWORD 'ayantaraz2024';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE ayantaraz OWNER ayantaraz;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ayantaraz TO ayantaraz;" 2>/dev/null || true
    echo "✓ Database and user created"
else
    echo "✓ Database already exists"
fi

# Setup Redis
echo ""
echo "Starting Redis..."
systemctl restart redis-server 2>/dev/null || service redis-server restart 2>/dev/null || true
echo "✓ Redis ready"

# Install Node.js dependencies
echo ""
echo "[INSTALLING] Node.js dependencies..."
cd /opt/ayantaraz
npm install
echo "✓ Dependencies installed"

# Final summary
echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "📍 Server: $SERVER_IP"
echo "🌐 API URL: http://$SERVER_IP:3001/api"
echo "🔍 Health: http://$SERVER_IP:3001/health"
echo ""
echo "👤 Admin Phone Numbers:"
echo "   - 09133374162"
echo "   - 09134292329"
echo ""
echo "🚀 To start the application:"
echo "   cd $REPO_DIR"
echo "   ./start.sh"
echo ""
echo "⛔ To stop the application:"
echo "   cd $REPO_DIR"
echo "   ./stop.sh"
echo ""
echo "⚙️ Configuration:"
echo "   - CAPTCHA: DISABLED ✓"
echo "   - CORS: All origins allowed ✓"
echo "   - IP-based: 202.133.91.13 ✓"
echo "   - Admin phones: 09133374162, 09134292329 ✓"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   1. Change all secrets in .env BEFORE production use"
echo "   2. Enable HTTPS with Nginx when ready"
echo "   3. Set COOKIE_SECURE=true when using HTTPS"
echo "   4. Set ALLOW_ALL_ORIGINS=false in production"
echo "   5. Enable CAPTCHA by setting CAPTCHA_SECRET"
echo ""
echo "=============================================="
