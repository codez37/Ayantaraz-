#!/bin/bash

# Ayantaraz - Complete Deployment Script for Server 202.133.91.13
set -e

SERVER_IP="202.133.91.13"
REPO_DIR="/opt/ayantaraz"

echo "=============================================="
echo "  Ayantaraz Deployment for $SERVER_IP"
echo "=============================================="
echo ""

# Install dependencies
echo "[1/5] Installing system dependencies..."
apt-get update -qq > /dev/null 2>&1
apt-get install -y -qq git curl nodejs npm postgresql postgresql-contrib redis-server > /dev/null 2>&1
echo "✓ Dependencies installed"

# Clone or update repository
echo ""
echo "[2/5] Setting up repository..."
if [ -d "$REPO_DIR/.git" ]; then
    cd "$REPO_DIR"
    git pull origin main
else
    git clone https://github.com/codez37/Ayantaraz- "$REPO_DIR"
    cd "$REPO_DIR"
fi
echo "✓ Repository ready"

# Create .env file
echo ""
echo "[3/5] Creating .env file..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3001
API_URL=http://202.133.91.13:3001
DATABASE_URL=postgresql://ayantaraz:ayantaraz2024@localhost:5432/ayantaraz?schema=public
JWT_SECRET=ayantaraz-production-secret-key-2024-change-me
JWT_REFRESH_SECRET=ayantaraz-production-refresh-secret-2024-change-me
REDIS_HOST=localhost
REDIS_PORT=6379
FILE_ENCRYPTION_KEY=ayantaraz-file-encryption-key-32-chars-2024
CAPTCHA_SECRET=
ALLOW_ALL_ORIGINS=true
TRUSTED_ORIGINS=http://202.133.91.13,http://202.133.91.13:3000,http://202.133.91.13:3001
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax
DB_POOL_MAX_CONNECTIONS=20
DB_POOL_MIN_CONNECTIONS=5
DOCKER_ENV=false
ENVEOF
echo "✓ .env created"

# Create seed script
echo ""
echo "[4/5] Creating seed script..."
mkdir -p scripts
cat > scripts/seed-admin.js << 'SEEDEOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ADMIN_PHONES = ['09133374162', '09134292329'];
async function main() {
  console.log('Seeding admin users...');
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
      await prisma.user.create({ data: { phone: phone, role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User' } });
      console.log('Created admin: ' + phone);
    }
  }
  console.log('Admin users seeded!');
  await prisma.$disconnect();
}
main().catch(e => { console.error('Error:', e); process.exit(1); });
SEEDEOF
echo "✓ Seed script created"

# Create start script
echo ""
echo "[5/5] Creating start script..."
cat > start.sh << 'STARTEOF'
#!/bin/bash
set -e
cd /opt/ayantaraz
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..
node scripts/seed-admin.js
npm run start:prod
STARTEOF
chmod +x start.sh
echo "✓ Start script created"

# Setup PostgreSQL
echo ""
echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER ayantaraz WITH PASSWORD 'ayantaraz2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ayantaraz OWNER ayantaraz;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ayantaraz TO ayantaraz;" 2>/dev/null || true
echo "✓ PostgreSQL ready"

# Setup Redis
echo ""
echo "Starting Redis..."
systemctl restart redis-server 2>/dev/null || service redis-server restart 2>/dev/null || true
echo "✓ Redis ready"

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "API URL: http://202.133.91.13:3001/api"
echo "Health: http://202.133.91.13:3001/health"
echo ""
echo "Admin phones: 09133374162, 09134292329"
echo ""
echo "To start: cd $REPO_DIR && ./start.sh"
echo "=============================================="
