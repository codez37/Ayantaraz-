#!/bin/sh

# Ayantaraz Web Entrypoint Script
# Production-Ready | Next.js Standalone

set -e

echo "Ayantaraz Web Entrypoint"

export NODE_ENV=production
export HOSTNAME=${HOSTNAME:-0.0.0.0}
export PORT=${PORT:-3000}

if [ -f /app/server.js ]; then
    echo "Starting Next.js standalone (root layout)..."
    exec node /app/server.js
elif [ -f /app/apps/web/server.js ]; then
    echo "Starting Next.js standalone (nested layout)..."
    cd /app/apps/web
    exec node server.js
else
    echo "ERROR: server.js not found in standalone output"
    ls -la /app/ /app/apps/web/ 2>/dev/null || true
    exit 1
fi
