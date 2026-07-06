#!/bin/sh
set -e

# Find server.js
for path in \
  "/app/apps/web/.next/standalone/server.js" \
  "/app/apps/web/.next/standalone/apps/web/server.js"
do
  if [ -f "$path" ]; then
    SERVER_JS="$path"
    break
  fi
done

if [ -z "$SERVER_JS" ]; then
  echo "ERROR: server.js not found"
  find /app/apps/web/.next/standalone -name "server.js" 2>/dev/null || true
  exit 1
fi

echo "Starting: $SERVER_JS"
cd "$(dirname "$SERVER_JS")"
exec node "$(basename "$SERVER_JS")"
