#!/bin/bash
# Build Validation Gate
# Runs AFTER build, BEFORE Docker packaging
# Exits non-zero on ANY failure — no silent corrupt builds
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $name"
    ((FAIL++))
  fi
}

echo "=== Build Validation Gate ==="
echo ""

# ── 1. Artifact existence ──
echo "--- Artifact Existence ---"
check "shared/dist/ exists"          "test -d packages/shared/dist"
check "shared/dist/index.js exists"  "test -f packages/shared/dist/index.js"
check "shared/dist/index.d.ts exists" "test -f packages/shared/dist/index.d.ts"
check "api/dist/ exists"             "test -d apps/api/dist"
check "api/dist/main.js exists"      "test -f apps/api/dist/main.js"
check "api/dist/main.d.ts exists"    "test -f apps/api/dist/main.d.ts"
echo ""

# ── 2. No source code in dist ──
echo "--- Source Code Boundary ---"
check "shared/dist has no .ts files" "find packages/shared/dist -name '*.ts' | grep -q . && exit 1 || exit 0"
check "api/dist has no .ts files"    "find apps/api/dist -name '*.ts' | grep -q . && exit 1 || exit 0"
check "shared/dist has no src/ dir"  "test ! -d packages/shared/dist/src"
check "api/dist has no src/ dir"     "test ! -d apps/api/dist/src"
echo ""

# ── 3. No workspace imports in dist ──
echo "--- Workspace Import Boundary ---"
check "shared/dist has no @ayantaraz imports" \
  "grep -r '@ayantaraz' packages/shared/dist --include='*.js' | grep -q . && exit 1 || exit 0"
check "api/dist has no relative prisma imports (../prisma)" \
  "grep -r \"from ['\"]\.\.\/.*prisma\" apps/api/dist --include='*.js' | grep -q . && exit 1 || exit 0"
echo ""

# ── 4. Dependency graph integrity ──
echo "--- Dependency Graph ---"
check "shared package.json main points to dist" \
  "node -e \"const p=require('./packages/shared/package.json'); if(!p.main||!p.main.includes('dist')) throw new Error()\""
check "shared package.json types points to dist" \
  "node -e \"const p=require('./packages/shared/package.json'); if(!p.types||!p.types.includes('dist')) throw new Error()\""
check "api references shared in tsconfig" \
  "grep -q '../../packages/shared' apps/api/tsconfig.build.json"
check "turbo.json has ^build dependency" \
  "grep -q '\"\\^build\"' turbo.json"
echo ""

# ── 5. Runtime boundary enforcement ──
echo "--- Runtime Boundary ---"
check "api/dist/index.js has no .ts extension imports" \
  "grep -r \"require.*\\.ts\" apps/api/dist --include='*.js' | grep -q . && exit 1 || exit 0"
check "api/dist has no test files" \
  "find apps/api/dist -name '*.spec.js' -o -name '*.test.js' | grep -q . && exit 1 || exit 0"
echo ""

# ── 6. Build graph correctness ──
echo "--- Build Graph ---"
check "tsconfig.base.json exists"      "test -f tsconfig.base.json"
check "turbo.json exists"              "test -f turbo.json"
check "root tsconfig.json has references" \
  "grep -q '\"references\"' tsconfig.json"
echo ""

# ── Summary ──
echo "=== Results ==="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo -e "${RED}BUILD VALIDATION FAILED — DO NOT PACKAGE${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}BUILD VALIDATION PASSED — SAFE TO PACKAGE${NC}"
exit 0
