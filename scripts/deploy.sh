#!/bin/sh
set -u

echo "[DEPRECATED] deploy.sh is deprecated. Use 'ayan-deploy' instead."
echo "[DEPRECATED] Redirecting to ayan-deploy..."

# Redirect to ayan-deploy if available
if command -v ayan-deploy >/dev/null 2>&1; then
  exec ayan-deploy "$@"
fi

# Fallback: warn and exit
echo "[ERROR] ayan-deploy not found. Install via bootstrap.sh"
echo "[ERROR] Aborting to prevent unsafe deployment."
exit 1
