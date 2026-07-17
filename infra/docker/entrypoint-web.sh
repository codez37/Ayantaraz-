#!/bin/sh
set -eu

echo "Ayantaraz Web Entrypoint"
echo "[1/1] Starting Next.js web server..."

if [ ! -f /app/server.js ]; then
  echo "[ERROR] Next.js standalone server.js not found" >&2
  exit 1
fi

exec node /app/server.js
