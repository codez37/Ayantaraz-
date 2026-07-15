#!/bin/sh

# Ayantaraz API Entrypoint Script
# Production-Ready | Server: 202.133.91.13

set -e

echo "Ayantaraz API Entrypoint"
echo "Server: 202.133.91.13"

# Ensure uploads directory exists
mkdir -p /app/uploads
chown -R 1001:1001 /app/uploads
chmod -R 755 /app/uploads

echo "[1/3] Initializing uploads directory..."

# Run database migrations
echo "[2/3] Running Prisma migrations..."
if [ -f /app/node_modules/.bin/prisma ]; then
    /app/node_modules/.bin/prisma migrate deploy --schema=/app/prisma/schema.prisma
    echo "Migrations applied"
else
    echo "Prisma CLI not found, skipping migrations"
fi

# Start the application
echo "[3/3] Starting Ayantaraz API..."

exec node /app/dist/main.js