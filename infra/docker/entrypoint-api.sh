#!/bin/sh

# Ayantaraz API Entrypoint Script
# Production-Ready | Server: 202.133.91.13

set -e

echo "Ayantaraz API Entrypoint"
echo "Server: 202.133.91.13"

# Ensure uploads directory exists
mkdir -p /app/uploads 2>/dev/null || true
chown -R 1001:1001 /app/uploads 2>/dev/null || true
chmod -R 755 /app/uploads 2>/dev/null || true

echo "[1/4] Initializing uploads directory..."

# Locate prisma CLI (global install or local)
PRISMA_BIN=""
if command -v prisma >/dev/null 2>&1; then
  PRISMA_BIN="prisma"
elif [ -f /app/node_modules/.bin/prisma ]; then
  PRISMA_BIN="/app/node_modules/.bin/prisma"
fi

# Run database migrations
echo "[2/4] Running Prisma migrations..."
if [ -n "$PRISMA_BIN" ]; then
    $PRISMA_BIN migrate deploy --schema=/app/prisma/schema.prisma
    echo "Migrations applied"
else
    echo "WARNING: Prisma CLI not found, skipping migrations"
fi

# Run database seed (admin users + reference data)
echo "[3/4] Running database seed..."
if [ -f /app/prisma/seed.js ]; then
    node /app/prisma/seed.js || echo "WARNING: Seed completed with warnings"
else
    echo "WARNING: seed.js not found, skipping seed"
fi

# Start the application
echo "[4/4] Starting Ayantaraz API..."

exec node /app/dist/main.js
