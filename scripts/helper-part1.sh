#!/usr/bin/env bash
set -uo pipefail
D="/opt/ayan-taraz"; LD="/var/lock/ayan-deploy"; LF="${LD}/deploy.lock"
RD="${D}/releases"; ED="${D}/env"; SD="${D}/state"
SF="${SD}/machine.state"; EL="${SD}/events.log"; EK="${SD}/events.lock"
SQ="${SD}/event_seq"; GF="${SD}/generation"
SK="${SD}/deploy.key"; PK="${SD}/deploy.key.prev"
CL="${D}/current"; MR=5; PF="${SD}/pinned_releases"; FR="${SD}/freeze"
DT=30; DP=1; ACTION="${1:-}"; shift 2>/dev/null || true
TID="${TRACE_ID:-}"
log(){ echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"; }

# FIX 3: Docker readiness check
docker_ready(){ docker info >/dev/null 2>&1 || { log "ERROR: Docker daemon not ready"; exit 1; }; }
[[ "${ACTION}" == "deploy" || "${ACTION}" == "activate" || "${ACTION}" == "release" ]] && docker_ready

gen_trace(){ [ -z "${TID}" ] && TID="d_$(date -u +%Y%m%d%H%M%S)_$(head -c 4 /dev/urandom | od -An -tx1 | tr -d ' ' 2>/dev/null||echo x)"; export TID; }
get_gen(){ local g=1; [ -f "${GF}" ] && g=$(($(cat "${GF}" 2>/dev/null||echo 0)+1)); echo "${g}">"${GF}"; chmod 644 "${GF}" 2>/dev/null||true; echo "${g}"; }
get_seq(){ local s=1; [ -f "${SQ}" ] && s=$(($(cat "${SQ}" 2>/dev/null||echo 0)+1)); echo "${s}">"${SQ}"; chmod 644 "${SQ}" 2>/dev/null||true; echo "${s}"; }
# RUN_ID: deterministic hash from version + timestamp (truncated to seconds)
gen_run_id(){
  local ver="${1:-${STATE_VER:-unknown}}"
  local ts; ts=$(date -u +"%Y%m%d%H%M%S")
  RUN_ID=$(echo -n "${ver}:${ts}"|sha256sum|cut -d' ' -f1|head -c 16)
  export RUN_ID
}
# Check duplicate: if RUN_ID exists in event log, skip
check_duplicate(){
  [ -f "${EL}" ] || return 0
  grep -q "run_id=${RUN_ID}" "${EL}" 2>/dev/null && { event "WARN" "DUPLICATE_RUN" "run_id=${RUN_ID}"; log "ERROR: Duplicate run detected (${RUN_ID})"; return 1; }
  return 0
}
# Snapshot: backup state file before critical transitions
snapshot_state(){
  local snap="${SF}.snap.$(date -u +%Y%m%d%H%M%S)"
  [ -f "${SF}" ] && cp "${SF}" "${snap}" 2>/dev/null||true
  chmod 644 "${snap}" 2>/dev/null||true
}
# Tool completed: emit structured event after each step
tool_complete(){
  local step="$1" result="$2"
  local rh; rh=$(echo -n "${result}"|sha256sum|cut -d' ' -f1|head -c 16)
  event "INFO" "tool.completed" "run_id=${RUN_ID:-} step=${step} result_hash=${rh}"
}
# Verify consistency: compare state hash with event log replay
verify_consistency(){
  [ -f "${SF}" ] || { log "WARN: No state file"; return 0; }
  [ -f "${EL}" ] || { log "WARN: No event log"; return 0; }
  # Current state hash
  local current_hash; current_hash=$(sha256sum "${SF}" 2>/dev/null|cut -d' ' -f1)
  # Replay event log to get expected state
  local tmp_state="${SF}.verify.$$"
  local lcp="" lcv="" lct="" it=false tp="" tv=""
  while read -r ln; do
    echo "${ln}"|grep -q "TX_BEGIN"&&{ it=true; tp=$(echo "${ln}"|grep -oP 'phase=\S+'|cut -d= -f2); tv=$(echo "${ln}"|grep -oP 'version=\S+'|cut -d= -f2); continue; }
    echo "${ln}"|grep -q "TX_COMMIT"&&{ if [ "${it}" = "true" ]; then lcp="${tp}"; lcv="${tv}"; lct=$(echo "${ln}"|cut -d' ' -f2); fi; it=false; continue; }
    echo "${ln}"|grep -q "TX_ROLLBACK"&&{ it=false; }
  done < "${EL}"
  if [ -n "${lcp}" ]; then
    local sn; case "${lcp}" in *ACTIVE*) sn="ACTIVE" ;; *HEALTHCHECK*) sn="HEALTHCHECK" ;; *ACTIVATING*) sn="ACTIVATING" ;; *EXTRACTING*) sn="EXTRACTING" ;; *PREPARING*) sn="PREPARING" ;; *ROLLING_BACK*) sn="ROLLING_BACK" ;; *) sn="${lcp}" ;; esac
    cat > "${tmp_state}" << EOF
STATE=${sn}
STATE_TIME=${lct}
STATE_VER=${lcv}
TRACE_ID=
EOF
    local expected_hash; expected_hash=$(sha256sum "${tmp_state}" 2>/dev/null|cut -d' ' -f1)
    rm -f "${tmp_state}" 2>/dev/null||true
    if [ "${current_hash}" != "${expected_hash}" ]; then
      event "ERROR" "CONSISTENCY_FAIL" "current=${current_hash:0:16} expected=${expected_hash:0:16}"
      log "ERROR: Consistency check failed (state hash mismatch)"
      return 1
    fi
  fi
  return 0
}

event(){
  local lv="$1" ty="$2"; shift 2; local dt="$*"
  local ts sg sn tt
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  exec 9>"${EK}" 2>/dev/null||true; flock -x 9 2>/dev/null||true
  sn=$(get_seq); sg=$(get_gen); tt="${TID:-$(gen_trace)}"
  echo "${sn} ${ts} gen=${sg} trace=${tt} level=${lv} ${ty} ${dt}">>"${EL}"
  sync 2>/dev/null||true
  flock -u 9 2>/dev/null||true; exec 9>&- 2>/dev/null||true
  chmod 644 "${EL}" 2>/dev/null||true
}
tx_begin(){ sync 2>/dev/null||true; event "INFO" "TX_BEGIN" "phase=$1 version=${2:-}"; sync 2>/dev/null||true; }
tx_commit(){ sync 2>/dev/null||true; event "INFO" "TX_COMMIT" "phase=$1 version=${2:-}"; sync 2>/dev/null||true; }
tx_rollback(){ event "WARN" "TX_ROLLBACK" "phase=$1 reason=${2:-} version=${3:-}"; sync 2>/dev/null||true; }

query_events(){
  local ft="${1:-}" fv="${2:-}" fs="${3:-}" lm="${4:-50}"
  [ -f "${EL}" ] || { echo "(empty)"; return; }
  local tf="/tmp/eq$$"; cp "${EL}" "${tf}" 2>/dev/null||{ echo "(copy fail)"; return; }
  [ -n "${ft}" ] && grep "trace=${ft}" "${tf}">"${tf}.f" 2>/dev/null&&mv "${tf}.f" "${tf}"
  [ -n "${fv}" ] && grep "${fv}" "${tf}">"${tf}.f" 2>/dev/null&&mv "${tf}.f" "${tf}"
  [ -n "${fs}" ] && grep "${fs}" "${tf}">"${tf}.f" 2>/dev/null&&mv "${tf}.f" "${tf}"
  sort -n "${tf}" 2>/dev/null|tail -n "${lm}"
  rm -f "${tf}" "${tf}.f" 2>/dev/null||true
}
detect_forks(){
  [ -f "${EL}" ] || return 0; local pg=0 fc=0
  while read -r ln; do
    local g; g=$(echo "${ln}"|grep -oP 'gen=\d+'|head -1|cut -d= -f2||echo 0)
    [ "${g}" -lt "${pg}" ] 2>/dev/null&&{ event "WARN" "FORK_DETECTED" "prev=${pg} cur=${g}"; fc=$((fc+1)); }
    pg="${g}"
  done < "${EL}"
  [ "${fc}" -gt 0 ] && { event "ERROR" "FORK_SUMMARY" "count=${fc}"; return 1; }
  return 0
}
reconstruct_from_events(){
  [ -f "${EL}" ] || return 0
  local lcp="" lcv="" lct="" it=false tp="" tv=""
  while read -r ln; do
    echo "${ln}"|grep -q "TX_BEGIN"&&{ it=true; tp=$(echo "${ln}"|grep -oP 'phase=\S+'|cut -d= -f2); tv=$(echo "${ln}"|grep -oP 'version=\S+'|cut -d= -f2); continue; }
    echo "${ln}"|grep -q "TX_COMMIT"&&{ if [ "${it}" = "true" ]; then lcp="${tp}"; lcv="${tv}"; lct=$(echo "${ln}"|cut -d' ' -f2); fi; it=false; continue; }
    echo "${ln}"|grep -q "TX_ROLLBACK"&&{ it=false; }
  done < "${EL}"
  if [ -n "${lcp}" ]; then
    local sn; case "${lcp}" in *ACTIVE*) sn="ACTIVE" ;; *HEALTHCHECK*) sn="HEALTHCHECK" ;; *ACTIVATING*) sn="ACTIVATING" ;; *EXTRACTING*) sn="EXTRACTING" ;; *PREPARING*) sn="PREPARING" ;; *ROLLING_BACK*) sn="ROLLING_BACK" ;; *) sn="${lcp}" ;; esac
    cat > "${SF}" << EOF
STATE=${sn}
STATE_TIME=${lct}
STATE_VER=${lcv}
TRACE_ID=
EOF
    chmod 644 "${SF}" 2>/dev/null||true; log "Reconstructed: ${sn} ${lcv}"
  fi
}
