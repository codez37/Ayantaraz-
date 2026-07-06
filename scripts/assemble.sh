#!/usr/bin/env bash
# Assembles bootstrap.sh and ayan-deploy helper from parts
# Run this after editing any part files
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/.build"

mkdir -p "${BUILD_DIR}"

# Assemble bootstrap.sh (no longer needs helper parts - bootstrap handles everything)
cp "${SCRIPT_DIR}/bootstrap.sh" "${BUILD_DIR}/bootstrap.sh"

chmod +x "${BUILD_DIR}/bootstrap.sh"

# Assemble standalone ayan-deploy helper
cat \
  "${SCRIPT_DIR}/helper-part1.sh" \
  "${SCRIPT_DIR}/helper-part2.sh" \
  "${SCRIPT_DIR}/helper-part3.sh" \
  "${SCRIPT_DIR}/helper-part4.sh" \
  > "${BUILD_DIR}/ayan-deploy"

chmod +x "${BUILD_DIR}/ayan-deploy"

echo "Assembled:"
echo "  ${BUILD_DIR}/bootstrap.sh"
echo "  ${BUILD_DIR}/ayan-deploy"
echo ""
echo "Size:"
wc -c "${BUILD_DIR}/bootstrap.sh" "${BUILD_DIR}/ayan-deploy"
