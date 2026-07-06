#!/bin/bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3001}"
TIMEOUT="${TIMEOUT:-10}"

echo "Checking API health: ${API_URL}/health"
HEALTH=$(curl -sf --max-time "$TIMEOUT" "${API_URL}/health" 2>/dev/null || echo "")

if [ -z "$HEALTH" ]; then
  echo "HEALTHCHECK FAILED: No response from API"
  exit 1
fi

STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "parse_error")

if [ "$STATUS" = "ok" ]; then
  echo "HEALTHCHECK OK: API is healthy"
  exit 0
else
  echo "HEALTHCHECK FAILED: API status = ${STATUS}"
  exit 1
fi
