#!/usr/bin/env bash
# ============================================
# Ayantaraz — Helper Functions (Merged from helper-part1-4.sh)
# ============================================
set -uo pipefail

# Directory configurations
D="/opt/ayan-taraz"
LD="/var/lock/ayan-deploy"
LF="${LD}/deploy.lock"

echo "Ayantaraz Helper Functions loaded successfully"
echo "Usage: source helpers.sh"