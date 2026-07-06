#!/bin/sh
set -e
export NODE_ENV=production
echo "[SDDK] runtime boot"
echo "[SDDK] waiting for postgres..."
pg_isready -h postgres -U ayantaraz -q || { echo "[SDDK] postgres not ready"; exit 1; }
echo "[SDDK] running prisma migrate..."
npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null || true
echo "[SDDK] waiting for redis..."
redis-cli -h redis -a "${REDIS_PASSWORD}" ping 2>/dev/null | grep -q PONG || { echo "[SDDK] redis not ready"; exit 1; }
echo "[SDDK] starting application..."
cd /app/apps/api
exec node dist/main.js
