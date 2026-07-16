read_state(){
  STATE="IDLE"; STATE_TIME=""; STATE_VER=""; TID="${TRACE_ID:-}"
  if [ -f "${SF}" ]; then while IFS='=' read -r k v; do case "$k" in
    STATE) STATE="$v" ;; STATE_TIME) STATE_TIME="$v" ;; STATE_VER) STATE_VER="$v" ;; TRACE_ID) [ -n "${v}" ] && TID="$v" ;;
  esac; done < "${SF}" 2>/dev/null||true; fi
  [ -n "${TID}" ] && export TRACE_ID="${TID}" || true
}
write_state(){
  local ns="$1" vv="${2:-${STATE_VER:-}}" ts tt tmp
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ"); tt="${TID:-$(gen_trace)}"
  tmp="${SF}.tmp.$$"
  cat > "${tmp}" << EOF
STATE=${ns}
STATE_TIME=${ts}
STATE_VER=${vv}
TRACE_ID=${tt}
EOF
  sync 2>/dev/null||true; mv "${tmp}" "${SF}" 2>/dev/null||{ cp "${tmp}" "${SF}"; rm -f "${tmp}"; }
  chmod 644 "${SF}" 2>/dev/null||true
  STATE="${ns}"; STATE_TIME="${ts}"; STATE_VER="${vv}"; TID="${tt}"; export TRACE_ID="${TID}"
  log "STATE: ${ns} ${vv:+(${vv})} trace=${tt}"
}
assert_state(){ read_state; [ "${STATE}" = "$1" ] || { event "ERROR" "ASSERT_FAIL" "expected=$1 got=${STATE}"; log "ERROR: Expected $1, got ${STATE}"; exit 1; } }
acquire_lock(){
  mkdir -p "${LD}"
  if [ -f "${LF}" ]; then
    local lock_age lock_ts now_ts
    lock_ts=$(stat -c %Y "${LF}" 2>/dev/null||echo 0)
    now_ts=$(date +%s)
    lock_age=$((now_ts - lock_ts))
    if [ ${lock_age} -gt 600 ] 2>/dev/null; then
      event "WARN" "LOCK_TTL_EXPIRED" "age=${lock_age}s"; log "WARN: Lock expired (age ${lock_age}s). Releasing..."
      rm -f "${LF}"
    fi
  fi
  exec 200>"${LF}"
  if ! flock -n 200 2>/dev/null; then
    local pid; pid=$(head -1 "${LF}" 2>/dev/null||echo "")
    if [ -n "${pid}" ] && [ "${pid}" -gt 0 ] 2>/dev/null; then
      kill -0 "${pid}" 2>/dev/null&&{ event "ERROR" "LOCK_HELD" "pid=${pid}"; log "ERROR: Lock held by PID ${pid}"; exit 1; }
      event "WARN" "STALE_LOCK_RECOVERED" "dead_pid=${pid}"; log "WARN: Stale lock (dead PID ${pid}). Recovering..."
      rm -f "${LF}"; exec 200>"${LF}"; flock -n 200||{ log "ERROR: Cannot acquire"; exit 1; }
    else event "ERROR" "LOCK_HELD_NO_PID"; log "ERROR: Lock held, no PID"; exit 1; fi
  fi
  echo $$ >&200; echo "$(date +%s)" >&200; event "INFO" "LOCK_ACQUIRED"; log "Lock acquired (PID: $$)"
}
release_lock(){ rm -f "${LF}" 2>/dev/null||true; event "INFO" "LOCK_RELEASED"; }
verify_hmac(){
  local f="$1" exp="$2"; [ -f "${f}" ] || return 1; local a
  if [ -f "${SK}" ]; then a=$(openssl dgst -sha256 -hmac "$(cat ${SK})" "${f}" 2>/dev/null|cut -d' ' -f2||echo ""); [ "${a}" = "${exp}" ]&&return 0; fi
  if [ -f "${PK}" ]; then a=$(openssl dgst -sha256 -hmac "$(cat ${PK})" "${f}" 2>/dev/null|cut -d' ' -f2||echo ""); [ "${a}" = "${exp}" ]&&return 0; fi
  return 1
}
get_key_version(){ sha256sum "${SK}" 2>/dev/null|cut -d' ' -f1|head -c 8||echo "unknown"; }
rotate_key(){
  local oh; oh=$(sha256sum "${SK}" 2>/dev/null|cut -d' ' -f1||echo "none")
  [ -f "${SK}" ] && cp "${SK}" "${PK}"
  local tmp="${SK}.tmp.$$"; openssl rand -hex 32>"${tmp}" 2>/dev/null; sync 2>/dev/null||true
  mv "${tmp}" "${SK}" 2>/dev/null||{ rm -f "${tmp}"; exit 1; }
  chmod 600 "${SK}"; chown root:root "${SK}"; chmod 600 "${PK}"; chown root:root "${PK}" 2>/dev/null||true
  local nh kv; nh=$(sha256sum "${SK}"|cut -d' ' -f1); kv=$(get_key_version)
  event "INFO" "KEY_ROTATED" "old=${oh:0:16} new=${nh:0:16} version=${kv}"; log "Key rotated. Version: ${kv}"
}
validate_env_semantics(){
  local ef="$1" er=0; [ -f "${ef}" ] || { log "  FAIL: .env missing"; return 1; }
  local db jwt jr pg ne ru rp
  db=$(grep '^DATABASE_URL=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  jwt=$(grep '^JWT_SECRET=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  jr=$(grep '^JWT_REFRESH_SECRET=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  pg=$(grep '^POSTGRES_PASSWORD=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  ne=$(grep '^NODE_ENV=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  ru=$(grep '^REDIS_URL=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  rp=$(grep '^REDIS_PASSWORD=' "${ef}" 2>/dev/null|cut -d= -f2-||echo "")
  [[ "${db}" == postgresql://* ]]||{ log "  FAIL: DATABASE_URL invalid"; er=$((er+1)); }
  [ ${#jwt} -ge 32 ]||{ log "  FAIL: JWT_SECRET < 32"; er=$((er+1)); }
  [ "${jwt}" != "${jr}" ]||{ log "  FAIL: JWT==REFRESH"; er=$((er+1)); }
  [ -n "${pg}" ]||{ log "  FAIL: POSTGRES_PASSWORD missing"; er=$((er+1)); }
  [ "${ne}" = "production" ]||{ log "  FAIL: NODE_ENV!=production"; er=$((er+1)); }
  [ -n "${ru}" ]||{ log "  FAIL: REDIS_URL missing"; er=$((er+1)); }
  [ ${#rp} -ge 8 ]||{ log "  FAIL: REDIS_PASSWORD < 8"; er=$((er+1)); }
  return ${er}
}
validate_release(){
  local d="$1" er=0
  [ -f "${d}/docker-compose.yml" ]||{ log "  FAIL: no compose"; er=$((er+1)); }
  [ -f "${d}/.env" ]||{ log "  FAIL: no .env"; er=$((er+1)); }
  [ -f "${d}/VERSION" ]||{ log "  FAIL: no VERSION"; er=$((er+1)); }
  [ -f "${d}/apps/api/Dockerfile" ]||{ log "  FAIL: no api df"; er=$((er+1)); }
  [ -f "${d}/apps/web/Dockerfile" ]||{ log "  FAIL: no web df"; er=$((er+1)); }
  [ -s "${d}/.env" ]||{ log "  FAIL: .env empty"; er=$((er+1)); }
  return ${er}
}

case "$ACTION" in
  state) read_state; echo "STATE=${STATE}"; echo "SINCE=${STATE_TIME}"; echo "VERSION=${STATE_VER}"; echo "TRACE=${TID}"; echo "SEQ=$(cat ${SQ} 2>/dev/null||echo 0)"; echo "GEN=$(cat ${GF} 2>/dev/null||echo 0)" ;;
  trace) gen_trace; echo "${TID}" ;;
  lock) gen_trace; acquire_lock; tool_complete "lock" "acquired"; gen_run_id; check_duplicate || { release_lock; exit 1; }; write_state "LOCKED" "${RUN_ID}"; event "INFO" "run.started" "run_id=${RUN_ID}" ;;
  lock-info) echo "Lock: ${LF}"; if [ -f "${LF}" ]; then pid=$(head -1 "${LF}" 2>/dev/null||echo "?"); echo "PID: ${pid}"; kill -0 "${pid}" 2>/dev/null&&echo "Alive: yes"||echo "Alive: no"; else echo "Status: FREE"; fi ;;
  lock-recover) gen_trace; event "WARN" "LOCK_FORCE_RECOVER"; rm -f "${LF}" 2>/dev/null||true; acquire_lock; release_lock; write_state "IDLE" "" ;;
  release)
    assert_state "LOCKED"; tx_begin "EXTRACTING"; VERSION="${1:?ver}"; RT="${RD}/${VERSION}"
    [ -d "${RT}" ]&&{ tx_rollback "EXTRACTING" "exists" "${VERSION}"; snapshot_state; write_state "FAILED" "${VERSION}"; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=exists"; release_lock; exit 1; }
    mkdir -p "${RT}"; tar -xzf /tmp/ayantaraz-deploy.tar.gz -C "${RT}"; rm -f /tmp/ayantaraz-deploy.tar.gz; tool_complete "extract" "${VERSION}"
    [ -L "${ED}/current.env" ]&&{ cp "$(readlink -f "${ED}/current.env")" "${RT}/.env"; chmod 600 "${RT}/.env"; chown root:root "${RT}/.env"; }
    echo "${VERSION}">"${RT}/VERSION"; echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ")">"${RT}/DEPLOY_TIME"
    kv=$(get_key_version); cat > "${RT}/BUILD_META" << EOF
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_HOST=${HOSTNAME:-unknown}
TRACE_ID=${TID:-$(gen_trace)}
KEY_VERSION=${kv}
EOF
    chown -R ayan:ayan "${RT}"; write_state "EXTRACTING" "${VERSION}"; tx_commit "EXTRACTING" "${VERSION}"; write_state "PREPARING" "${VERSION}" ;;
  gate) assert_state "PREPARING"; VERSION="${1:?ver}"; run_gate "${RD}/${VERSION}"||{ rm -f "${SD}/gate_state" 2>/dev/null||true; snapshot_state; write_state "FAILED" "${VERSION}"; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=gate_fail"; release_lock; exit 1; }; rm -f "${SD}/gate_state" 2>/dev/null||true; tool_complete "gate" "${VERSION}"; write_state "ACTIVATING" "${VERSION}" ;;
  activate)
    assert_state "ACTIVATING"; tx_begin "ACTIVATING"; VERSION="${1:?ver}"; RT="${RD}/${VERSION}"
    [ -d "${RT}" ]||{ tx_rollback "ACTIVATING" "not_found" "${VERSION}"; snapshot_state; write_state "FAILED" "${VERSION}"; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=not_found"; release_lock; exit 1; }
    graceful_drain; [ -L "${CL}" ]&&{ cd "${CL}"; docker compose down 2>/dev/null||true; cd /; }
    ln -snf "${RT}" "${CL}"; echo "${VERSION}">"${D}/VERSION"
    cd "${CL}"; docker compose pull 2>/dev/null||true; docker compose up -d --build; cd /; restore_traffic; tool_complete "activate" "${VERSION}"
    write_state "HEALTHCHECK" "${VERSION}"; tx_commit "ACTIVATING" "${VERSION}" ;;
  pass) assert_state "HEALTHCHECK"; verify_consistency || { snapshot_state; write_state "FAILED" "${STATE_VER:-}"; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=consistency_fail"; release_lock; exit 1; }; snapshot_state; tx_begin "ACTIVE"; write_state "ACTIVE" "${STATE_VER:-}"; tx_commit "ACTIVE" "${STATE_VER:-}"; event "INFO" "run.completed" "run_id=${RUN_ID:-}"; release_lock ;;
  fail) read_state; snapshot_state; tx_begin "FAILED"; write_state "FAILED" "${STATE_VER:-}"; tx_commit "FAILED" "${STATE_VER:-}"; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=manual"; release_lock ;;
  rollback)
    gen_trace; read_state; tx_begin "ROLLING_BACK"; write_state "ROLLING_BACK" "${STATE_VER:-}"
    [ -L "${CL}" ]||{ tx_rollback "ROLLING_BACK" "no_current"; snapshot_state; write_state "ROLLBACK_FAILED" ""; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=no_current"; release_lock; exit 1; }
    CV=$(basename "$(readlink -f "${CL}")")
    PV=$(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r|grep -A1 "^${CV}$"|tail -1)
    if [ -z "${PV}" ]||[ "${PV}" = "${CV}" ]; then PV=$(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r|sed -n '2p'); fi
    [ -n "${PV}" ]||{ tx_rollback "ROLLING_BACK" "no_previous"; snapshot_state; write_state "ROLLBACK_FAILED" ""; event "ERROR" "run.failed" "run_id=${RUN_ID:-} reason=no_previous"; release_lock; exit 1; }
    log "Rollback: ${CV} -> ${PV}"; validate_rollback_target "${RD}/${PV}"||log "WARN: Validation issues"
    graceful_drain; cd "${CL}"; docker compose down 2>/dev/null||true; cd /
    ln -snf "${RD}/${PV}" "${CL}"; echo "${PV}">"${D}/VERSION"
    cd "${CL}"; docker compose up -d --build; cd /; restore_traffic; tool_complete "rollback" "${PV}"
    write_state "HEALTHCHECK" "${PV}"; tx_commit "ROLLING_BACK" "${PV}"; event "INFO" "run.completed" "run_id=${RUN_ID:-} type=rollback"; release_lock ;;
  health)
    log "=== HEALTH CHECK ==="; [ -f "${D}/VERSION" ]&&echo "Version: $(cat ${D}/VERSION})"
    [ -f "${D}/current/DEPLOY_TIME" ]&&echo "Deployed: $(cat ${D}/current/DEPLOY_TIME})"
    if [ -L "${CL}" ]; then echo "Release: $(basename "$(readlink -f "${CL}")")"; else echo "Release: NONE"; exit 1; fi
    read_state; echo "State: ${STATE}"; echo "Trace: ${TID:-none}"; echo "Seq: $(cat ${SQ} 2>/dev/null||echo 0)"; echo "Gen: $(cat ${GF} 2>/dev/null||echo 0)"
    is_frozen&&echo "Freeze: ACTIVE"; [ -f "${PF}" ] && [ -s "${PF}" ]&&echo "Pinned: $(tr '
' ' ' < "${PF}")"
    echo ""; echo "Containers:"; cd "${CL}"; docker compose ps --format "  {{.Name}}: {{.Status}}" 2>/dev/null; cd /
    H=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null||echo "000")
    A=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/tax-engine/types 2>/dev/null||echo "000")
    L=$(curl -s -o /dev/null -w "%{time_total}" http://localhost/health 2>/dev/null||echo "?")
    RC=$(ls -1d "${RD}"/*/ 2>/dev/null|wc -l)
    echo "API Health: ${H} (target: 200)"; echo "Tax Engine: ${A} (target: 200)"; echo "Latency: ${L}s"; echo "Releases: ${RC}"
    [ "${H}" = "200" ]&&[ "${A}" = "200" ]&&echo "Status: HEALTHY"||echo "Status: UNHEALTHY"
    done; echo ""; check_invariants&&echo "Invariants: PASS"||echo "Invariants: FAIL" ;;
  validate) VERSION="${1:-}"; [ -z "${VERSION}" ]&&[ -L "${CL}" ]&&VERSION=$(basename "$(readlink -f "${CL}")"); [ -n "${VERSION}" ]||{ log "ERROR: No version"; exit 1; }; validate_release "${RD}/${VERSION}"; validate_env_semantics "${RD}/${VERSION}/.env" ;;
  *) echo "Usage: ayan-deploy {cmd} [args]"
    echo ""; echo "State: state|trace|events|reconstruct|consistency"
    echo "Lock:  lock|lock-info|lock-recover"
    echo "Deploy: release|gate|activate|pass|fail|rollback|health"
    echo "Mgmt:  prune|pin|unpin|freeze|thaw|invariants|validate|drift"
    echo "Recov: recover|rotate-key"; exit 1 ;;
esac
