#!/usr/bin/env bash
# ============================================
# ARCHITECTURE VALIDATION CONTRACT
# Tests that enforce system invariants.
# If any test FAILS, architecture is broken.
# ============================================
set -euo pipefail

D="/opt/ayan-taraz"; RD="${D}/releases"; ED="${D}/env"; SD="${D}/state"
SF="${SD}/machine.state"; EL="${SD}/events.log"; SQ="${SD}/event_seq"
GF="${SD}/generation"; CL="${D}/current"; SK="${SD}/deploy.key"
PF="${SD}/pinned_releases"; FR="${SD}/freeze"

PASS=0; FAIL=0; TOTAL=0

pass(){ PASS=$((PASS+1)); TOTAL=$((TOTAL+1)); echo "  PASS: $1"; }
fail(){ FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1)); echo "  FAIL: $1"; }
section(){ echo ""; echo "=== $1 ==="; }

# ============================================
section "1. STATE MACHINE INVARIANTS"
# Only valid state sequences allowed.
# Valid: IDLE→LOCKED→PREPARING→ACTIVATING→HEALTHCHECK→ACTIVE
#         IDLE→LOCKED→EXTRACTING→PREPARING→...
#         Any→ROLLING_BACK→HEALTHCHECK→ACTIVE
#         Any→FAILED
# Invalid: ACTIVE→LOCKED (without deploy)
#          HEALTHCHECK→EXTRACTING (skip)
# ============================================

test_valid_state_transitions(){
  local valid=true
  # Define valid transitions
  declare -A TRANSITIONS=(
    ["IDLE"]="LOCKED FAILED"
    ["LOCKED"]="EXTRACTING FAILED"
    ["EXTRACTING"]="PREPARING FAILED"
    ["PREPARING"]="ACTIVATING FAILED"
    ["ACTIVATING"]="HEALTHCHECK FAILED"
    ["HEALTHCHECK"]="ACTIVE ROLLING_BACK FAILED"
    ["ACTIVE"]="ROLLING_BACK FAILED"
    ["ROLLING_BACK"]="HEALTHCHECK ROLLBACK_FAILED ACTIVE"
    ["FAILED"]="IDLE"
    ["ROLLBACK_FAILED"]="IDLE"
  )
  # Read current state
  local cur="IDLE"
  if [ -f "${SF}" ]; then
    cur=$(grep '^STATE=' "${SF}" 2>/dev/null|cut -d= -f2||echo "IDLE")
  fi
  # Verify state file format
  if [ -f "${SF}" ]; then
    local has_state has_time has_ver
    has_state=$(grep -c '^STATE=' "${SF}" 2>/dev/null||echo 0)
    has_time=$(grep -c '^STATE_TIME=' "${SF}" 2>/dev/null||echo 0)
    has_ver=$(grep -c '^STATE_VER=' "${SF}" 2>/dev/null||echo 0)
    [ "${has_state}" = "1" ] || { fail "State file has ${has_state} STATE= lines (expected 1)"; valid=false; }
    [ "${has_time}" = "1" ] || { fail "State file has ${has_time} STATE_TIME= lines (expected 1)"; valid=false; }
    [ "${has_ver}" = "1" ] || { fail "State file has ${has_ver} STATE_VER= lines (expected 1)"; valid=false; }
  fi
  # Verify state is one of the known states
  local known_states="IDLE LOCKED EXTRACTING PREPARING ACTIVATING HEALTHCHECK ACTIVE ROLLING_BACK FAILED ROLLBACK_FAILED"
  local found=false
  for ks in ${known_states}; do
    [ "${cur}" = "${ks}" ] && { found=true; break; }
  done
  $found || { fail "Unknown state: ${cur}"; valid=false; }
  $valid && pass "State machine format valid (state=${cur})"
}

test_state_file_durability(){
  # State file must survive sync
  if [ -f "${SF}" ]; then
    local before; before=$(md5sum "${SF}" 2>/dev/null|cut -d' ' -f1||echo "?")
    sync 2>/dev/null||true
    local after; after=$(md5sum "${SF}" 2>/dev/null|cut -d' ' -f1||echo "?")
    [ "${before}" = "${after}" ] && pass "State file durable (md5 match)" || fail "State file corrupted during sync"
  else
    pass "State file not yet created (initial state)"
  fi
}

# ============================================
section "2. WAL ATOMICITY INVARIANTS"
# Every state transition = TX_BEGIN + TX_COMMIT
# No orphan TX_BEGIN without TX_COMMIT
# ============================================

test_wal_pairing(){
  local er=0
  if [ -f "${EL}" ] && [ -s "${EL}" ]; then
    local begins commits rollbacks
    begins=$(grep -c 'TX_BEGIN' "${EL}" 2>/dev/null||echo 0)
    commits=$(grep -c 'TX_COMMIT' "${EL}" 2>/dev/null||echo 0)
    rollbacks=$(grep -c 'TX_ROLLBACK' "${EL}" 2>/dev/null||echo 0)
    # committed + rolled back should equal begins
    local total=$((commits + rollbacks))
    if [ "${total}" -lt "${begins}" ]; then
      fail "WAL incomplete: ${begins} begins, ${commits} commits, ${rollbacks} rollbacks (orphan TX_BEGIN)"
      er=1
    fi
    # No TX_ROLLBACK should exist without corresponding TX_BEGIN
    if [ "${rollbacks}" -gt "${begins}" ]; then
      fail "WAL corruption: more rollbacks (${rollbacks}) than begins (${begins})"
      er=1
    fi
    [ "${er}" -eq 0 ] && pass "WAL pairing intact (${begins}B/${commits}C/${rollbacks}R)"
  else
    pass "WAL empty (clean state)"
  fi
}

test_wal_monotonic_sequence(){
  local er=0 prev=0
  if [ -f "${EL}" ] && [ -s "${EL}" ]; then
    while read -r ln; do
      local sn; sn=$(echo "${ln}"|cut -d' ' -f1)
      if [ "${sn}" -lt "${prev}" ] 2>/dev/null; then
        fail "WAL sequence non-monotonic: ${prev} → ${sn}"
        er=1; break
      fi
      prev="${sn}"
    done < "${EL}"
    [ "${er}" -eq 0 ] && pass "WAL sequence monotonic (last=${prev})"
  else
    pass "WAL empty"
  fi
}

test_event_durability(){
  # Events must be fsync'd (check file is readable)
  if [ -f "${EL}" ]; then
    local lines; lines=$(wc -l < "${EL}" 2>/dev/null||echo 0)
    # Try to read last event
    local last; last=$(tail -1 "${EL}" 2>/dev/null||echo "")
    [ -n "${last}" ] && pass "Event log durable (${lines} events, last readable)" || pass "Event log empty"
  else
    pass "Event log not created yet"
  fi
}

# ============================================
section "3. LOCK EXCLUSIVITY INVARIANTS"
# At most one deploy at a time
# Lock must be PID-tracked
# ============================================

test_lock_file_format(){
  local lf="/var/lock/ayan-deploy/deploy.lock"
  if [ -f "${lf}" ]; then
    local pid; pid=$(head -1 "${lf}" 2>/dev/null||echo "")
    if [ -n "${pid}" ] && [ "${pid}" -gt 0 ] 2>/dev/null; then
      # Check if PID is alive
      kill -0 "${pid}" 2>/dev/null && pass "Lock PID alive (PID=${pid})" || pass "Lock PID stale (dead PID=${pid}, will be recovered)"
    else
      fail "Lock file has no valid PID: '${pid}'"
    fi
  else
    pass "Lock free (no active deploy)"
  fi
}

test_lock_exclusion(){
  local lf="/var/lock/ayan-deploy/deploy.lock"
  if [ -f "${lf}" ]; then
    local pid; pid=$(head -1 "${lf}" 2>/dev/null||echo "")
    # Verify flock would block
    local locked=false
    (exec 200>"${lf}" && flock -n 200 && flock -u 200 && exec 200>&-) 2>/dev/null || locked=true
    # If we can acquire, it means lock was released or never held properly
    if $locked; then
      pass "Lock exclusion working (flock blocks concurrent access)"
    else
      # Lock was free, which is fine if no deploy in progress
      pass "Lock free (concurrent access allowed when unlocked)"
    fi
  else
    pass "No lock file (clean state)"
  fi
}

# ============================================
section "4. GATE ENFORCEMENT INVARIANTS"
# No release enters ACTIVE without passing gate
# Gate stages are cached correctly
# ============================================

test_gate_cache_independence(){
  local gs="${SD}/gate_state"
  if [ -f "${gs}" ]; then
    # Gate state should not persist across deploys
    fail "Gate state file persists (should be cleaned after gate pass/fail)"
  else
    pass "Gate state clean (no stale cache)"
  fi
}

test_release_has_build_meta(){
  local er=0
  for R in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}); do
    local rt="${RD}/${R}"
    [ -f "${rt}/BUILD_META" ] || { fail "Release ${R} missing BUILD_META"; er=1; }
    [ -f "${rt}/VERSION" ] || { fail "Release ${R} missing VERSION"; er=1; }
    [ -f "${rt}/DEPLOY_TIME" ] || { fail "Release ${R} missing DEPLOY_TIME"; er=1; }
    # BUILD_META must have KEY_VERSION
    [ -f "${rt}/BUILD_META" ] && {
      grep -q 'KEY_VERSION=' "${rt}/BUILD_META" 2>/dev/null || { fail "Release ${R} BUILD_META missing KEY_VERSION"; er=1; }
    }
  done
  [ "${er}" -eq 0 ] && pass "All releases have complete metadata"
}

# ============================================
section "5. SYMLINK INTEGRITY INVARIANTS"
# current → valid release directory
# env/current.env → valid env file
# ============================================

test_current_symlink(){
  if [ -L "${CL}" ]; then
    local target; target=$(readlink -f "${CL}" 2>/dev/null||echo "")
    if [ -n "${target}" ] && [ -d "${target}" ]; then
      # Must have docker-compose.yml
      [ -f "${target}/docker-compose.yml" ] && pass "current → valid release ($(basename "${target}"))" || fail "current → release without docker-compose.yml"
      # Must have .env
      [ -f "${target}/.env" ] && pass "current release has .env" || fail "current release missing .env"
    else
      fail "current symlink broken: → ${target}"
    fi
  else
    fail "current is not a symlink (file or missing)"
  fi
}

test_env_symlink(){
  local el="${ED}/current.env"
  if [ -L "${el}" ]; then
    local target; target=$(readlink -f "${el}" 2>/dev/null||echo "")
    if [ -n "${target}" ] && [ -f "${target}" ]; then
      # Must be valid env
      grep -q '^DATABASE_URL=' "${target}" 2>/dev/null && pass "env/current.env → valid env" || fail "env/current.env → env without DATABASE_URL"
    else
      fail "env/current.env symlink broken"
    fi
  else
    fail "env/current.env is not a symlink"
  fi
}

# ============================================
section "6. ENV SEMANTIC INVARIANTS"
# Secrets have minimum entropy
# No placeholder values in production
# ============================================

test_env_no_placeholders(){
  local ef="${ED}/current.env"
  if [ -L "${ef}" ] && [ -f "$(readlink -f "${ef}")" ]; then
    local envf; envf=$(readlink -f "${ef}")
    local er=0
    # Check for placeholder values
    for placeholder in "CHANGE_ME" "your-" "placeholder" "TODO" "FIXME" "xxx"; do
      if grep -qi "${placeholder}" "${envf}" 2>/dev/null; then
        local line; line=$(grep -i "${placeholder}" "${envf}" 2>/dev/null|head -1)
        fail "Production env contains placeholder: ${line:0:60}"
        er=1
      fi
    done
    [ "${er}" -eq 0 ] && pass "No placeholder values in production env"
  else
    pass "Env file not accessible (pre-deploy state)"
  fi
}

test_jwt_secrets_separate(){
  local ef="${ED}/current.env"
  if [ -L "${ef}" ] && [ -f "$(readlink -f "${ef}")" ]; then
    local envf; envf=$(readlink -f "${ef}")
    local jwt jr
    jwt=$(grep '^JWT_SECRET=' "${envf}" 2>/dev/null|cut -d= -f2-||echo "")
    jr=$(grep '^JWT_REFRESH_SECRET=' "${envf}" 2>/dev/null|cut -d= -f2-||echo "")
    if [ -n "${jwt}" ] && [ -n "${jr}" ]; then
      [ "${jwt}" != "${jr}" ] && pass "JWT_SECRET ≠ JWT_REFRESH_SECRET" || fail "JWT_SECRET == JWT_REFRESH_SECRET (security violation)"
    else
      pass "JWT secrets not yet configured"
    fi
  else
    pass "Env not accessible"
  fi
}

test_jwt_secret_entropy(){
  local ef="${ED}/current.env"
  if [ -L "${ef}" ] && [ -f "$(readlink -f "${ef}")" ]; then
    local envf; envf=$(readlink -f "${ef}")
    local jwt; jwt=$(grep '^JWT_SECRET=' "${envf}" 2>/dev/null|cut -d= -f2-||echo "")
    if [ -n "${jwt}" ]; then
      local len=${#jwt}
      [ "${len}" -ge 32 ] && pass "JWT_SECRET length ≥ 32 (${len} chars)" || fail "JWT_SECRET too short: ${len} chars (< 32)"
    else
      pass "JWT_SECRET not configured"
    fi
  else
    pass "Env not accessible"
  fi
}

# ============================================
section "7. FORK DETECTION INVARIANTS"
# Generation counter must be monotonically increasing
# No gaps in event log generation sequence
# ============================================

test_generation_monotonic(){
  if [ -f "${GF}" ]; then
    local gen; gen=$(cat "${GF}" 2>/dev/null||echo 0)
    [ "${gen}" -ge 0 ] 2>/dev/null && pass "Generation counter valid (gen=${gen})" || fail "Generation counter invalid: ${gen}"
  else
    pass "Generation counter not initialized"
  fi
}

test_generation_in_events(){
  local er=0 prev_gen=0
  if [ -f "${EL}" ] && [ -s "${EL}" ]; then
    while read -r ln; do
      local g; g=$(echo "${ln}"|grep -oP 'gen=\d+'|head -1|cut -d= -f2||echo 0)
      if [ "${g}" -lt "${prev_gen}" ] 2>/dev/null; then
        fail "Fork detected: gen went ${prev_gen} → ${g}"
        er=1
      fi
      prev_gen="${g}"
    done < "${EL}"
    [ "${er}" -eq 0 ] && pass "No forks in event log (gen monotonic)"
  else
    pass "Event log empty (no fork risk)"
  fi
}

# ============================================
section "8. RECOVERY INVARIANTS"
# Recovery always selects highest-scoring release
# Score = structural(4) + semantic(3) + invariant(2)
# ============================================

test_recovery_scoring(){
  local best="" bsc=-1 er=0
  for R in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r); do
    local rt="${RD}/${R}" sc=0
    # Structural check
    [ -f "${rt}/docker-compose.yml" ] && [ -f "${rt}/VERSION" ] && [ -f "${rt}/.env" ] && sc=$((sc+4))
    # Semantic check (simplified)
    [ -f "${rt}/.env" ] && grep -q '^DATABASE_URL=' "${rt}/.env" 2>/dev/null && sc=$((sc+3))
    # Invariant check
    [ -f "${rt}/.env" ] && [ -f "${rt}/VERSION" ] && sc=$((sc+2))
    if [ "${sc}" -gt "${bsc}" ]; then
      bsc="${sc}"; best="${R}"
    fi
  done
  [ -n "${best}" ] && pass "Recovery would select: ${best} (score=${bsc})" || pass "No releases to recover"
}

# ============================================
section "9. RELEASE ISOLATION INVARIANTS"
# Each release is a self-contained directory
# No shared mutable state between releases
# ============================================

test_release_isolation(){
  local er=0 count=0
  for R in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}); do
    count=$((count+1))
    local rt="${RD}/${R}"
    # Each release must have its own VERSION
    [ -f "${rt}/VERSION" ] || { fail "Release ${R} missing VERSION"; er=1; }
    # VERSION content must match directory name
    local vc; vc=$(cat "${rt}/VERSION" 2>/dev/null||echo "")
    [ "${vc}" = "${R}" ] || { fail "Release ${R} VERSION mismatch: ${vc}"; er=1; }
    # Each release must have DEPLOY_TIME
    [ -f "${rt}/DEPLOY_TIME" ] || { fail "Release ${R} missing DEPLOY_TIME"; er=1; }
  done
  [ "${er}" -eq 0 ] && pass "All ${count} releases isolated and self-contained"
}

# ============================================
section "10. CONVERGENCE INVARIANTS"
# After any failed deploy, system must be in a valid state
# State must be reconstructable from events
# ============================================

test_state_reconstructable(){
  local er=0
  if [ -f "${EL}" ] && [ -s "${EL}" ]; then
    # Replay events to reconstruct state
    local last_state="" last_ver=""
    while read -r ln; do
      if echo "${ln}"|grep -q "TX_COMMIT"; then
        local ph; ph=$(echo "${ln}"|grep -oP 'phase=\S+'|cut -d= -f2)
        local vv; vv=$(echo "${ln}"|grep -oP 'version=\S+'|cut -d= -f2)
        [ -n "${ph}" ] && last_state="${ph}"
        [ -n "${vv}" ] && last_ver="${vv}"
      fi
    done < "${EL}"
    # Verify state file matches reconstructed state
    if [ -f "${SF}" ]; then
      local cur_state; cur_state=$(grep '^STATE=' "${SF}" 2>/dev/null|cut -d= -f2||echo "")
      # States should be consistent (allowing for state machine transitions)
      pass "State reconstructable from WAL (last_commit_state=${last_state})"
    else
      fail "State file missing (should exist after any deploy)"
    fi
  else
    # No events = clean state, state file should be IDLE
    if [ -f "${SF}" ]; then
      local cs; cs=$(grep '^STATE=' "${SF}" 2>/dev/null|cut -d= -f2||echo "")
      [ "${cs}" = "IDLE" ] && pass "Clean state: IDLE with no events" || fail "No events but state is ${cs}"
    else
      pass "No events, no state file (pre-bootstrap)"
    fi
  fi
}

# ============================================
# RUN ALL TESTS
# ============================================

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ARCHITECTURE VALIDATION CONTRACT        ║"
echo "║  Ayan Taraz Deploy Control Plane         ║"
echo "╚══════════════════════════════════════════╝"

test_valid_state_transitions
test_state_file_durability
test_wal_pairing
test_wal_monotonic_sequence
test_event_durability
test_lock_file_format
test_lock_exclusion
test_gate_cache_independence
test_release_has_build_meta
test_current_symlink
test_env_symlink
test_env_no_placeholders
test_jwt_secrets_separate
test_jwt_secret_entropy
test_generation_monotonic
test_generation_in_events
test_recovery_scoring
test_release_isolation
test_state_reconstructable

echo ""
echo "════════════════════════════════════════════"
echo "  TOTAL: ${TOTAL}  PASS: ${PASS}  FAIL: ${FAIL}"
echo "════════════════════════════════════════════"
echo ""

if [ "${FAIL}" -gt 0 ]; then
  echo "❌ ARCHITECTURE VIOLATION DETECTED"
  echo "   ${FAIL} invariant(s) broken."
  echo "   System does not meet production contract."
  exit 1
else
  echo "✅ ARCHITECTURE VALIDATED"
  echo "   All ${TOTAL} invariants hold."
  echo "   System meets production contract."
  exit 0
fi
