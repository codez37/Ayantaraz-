#!/bin/sh

set -e

echo "Ayantaraz Web Entrypoint"

export NODE_ENV=production
export HOSTNAME=${HOSTNAME:-0.0.0.0}
export PORT=${PORT:-3000}

if [ -f /app/apps/web/server.js ]; then
    echo "Starting Next.js standalone (workspace layout)"
    cd /app/apps/web
    exec node server.js
fi

if [ -f /app/server.js ]; then
    echo "Starting Next.js standalone (root layout)"
    exec node /app/server.js
fi

echo "ERROR: standalone server.js missing"

find /app -name server.js | head -20

exit 1
