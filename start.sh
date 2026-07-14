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