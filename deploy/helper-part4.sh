read_state
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
    log "=== HEALTH CHECK ==="; [ -f "${D}/VERSION" ]&&echo "Version: $(cat ${D}/VERSION)"
    [ -f "${D}/current/DEPLOY_TIME" ]&&echo "Deployed: $(cat ${D}/current/DEPLOY_TIME)"
    if [ -L "${CL}" ]; then echo "Release: $(basename "$(readlink -f "${CL}")")"; else echo "Release: NONE"; exit 1; fi
    read_state; echo "State: ${STATE}"; echo "Trace: ${TID:-none}"; echo "Seq: $(cat ${SQ} 2>/dev/null||echo 0)"; echo "Gen: $(cat ${GF} 2>/dev/null||echo 0)"
    is_frozen&&echo "Freeze: ACTIVE"; [ -f "${PF}" ] && [ -s "${PF}" ]&&echo "Pinned: $(tr '\n' ' ' < "${PF}")"
    echo ""; echo "Containers:"; cd "${CL}"; docker compose ps --format "  {{.Name}}: {{.Status}}" 2>/dev/null; cd /
    H=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null||echo "000")
    A=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/tax-engine/types 2>/dev/null||echo "000")
    L=$(curl -s -o /dev/null -w "%{time_total}" http://localhost/health 2>/dev/null||echo "?")
    DR=$(docker exec ayantaraz-postgres pg_isready -U ayantaraz -d ayantaraz 2>/dev/null|grep -c "accepting"||echo 0)
    DM=$(docker exec ayantaraz-postgres psql -U ayantaraz -d ayantaraz -t -c "SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NULL;" 2>/dev/null|tr -d ' '||echo "?")
    R=$(docker exec ayantaraz-redis redis-cli ping 2>/dev/null|grep -c "PONG"||echo 0)
    RM=$(docker exec ayantaraz-redis redis-cli info memory 2>/dev/null|grep "used_memory_human"|cut -d: -f2|tr -d '\r'||echo "?")
    DK=$(df -h /opt/ayan-taraz|awk 'NR==2{print $5}')
    RC=$(ls -1d "${RD}"/*/ 2>/dev/null|wc -l)
    echo ""; echo "HTTP: ${H} $([ "${H}" = "200" ]&&echo OK||echo FAIL)"
    echo "API: ${A} $([ "${A}" = "200" ]&&echo OK||echo FAIL)"
    echo "Latency: ${L}s"; echo "DB: $([ "${DR}" = "1" ]&&echo ready||echo down)"
    echo "Migrations: ${DM} $([ "${DM}" = "0" ]&&echo OK||echo PENDING)"
    echo "Redis: $([ "${R}" = "1" ]&&echo ready||echo down)"
    echo "Redis mem: ${RM}"; echo "Disk: ${DK}"; echo "Releases: ${RC}"
    echo ""; check_invariants&&echo "Invariants: PASS"||echo "Invariants: FAIL"
    echo ""; echo "===============================" ;;
  consistency) log "=== RUNTIME CONSISTENCY ==="; runtime_check&&echo "PASS"||echo "FAIL" ;;
  prune)
    is_frozen&&{ log "SKIPPED: freeze"; exit 0; }
    KEEP=${1:-${MR}}; CV=""; [ -L "${CL}" ]&&CV=$(basename "$(readlink -f "${CL}")")
    K=0; RM=0; for R in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r); do
      K=$((K+1)); [ "${R}" = "${CV}" ]&&continue; is_pinned "${R}"&&{ log "  SKIP: ${R}"; continue; }
      [ ${K} -gt ${KEEP} ]&&{ log "  Removing: ${R}"; rm -rf "${RD}/${R}"; RM=$((RM+1)); }
    done; log "Pruned: ${RM}" ;;
  pin) VERSION="${1:-}"; [ -z "${VERSION}" ]&&[ -L "${CL}" ]&&VERSION=$(basename "$(readlink -f "${CL}")"); pin_release "${VERSION}" ;;
  unpin) VERSION="${1:-}"; [ -z "${VERSION}" ]&&[ -L "${CL}" ]&&VERSION=$(basename "$(readlink -f "${CL}")"); unpin_release "${VERSION}" ;;
  freeze) touch "${FR}"; event "INFO" "FREEZE_ON" ;;
  thaw) rm -f "${FR}"; event "INFO" "FREEZE_OFF" ;;
  invariants) check_invariants ;;
  
  create_deployment_state)
    event "INFO" "DS_CREATION_STARTED"
    DEPLOYMENT_ID="d_$(date -u +%Y%m%d%H%M%S)_$(head -c 4 /dev/urandom | od -An -tx1 | tr -d ' ' 2>/dev/null||echo xx)"
    event "INFO" "DS_CREATED" "deployment_id=${DEPLOYMENT_ID}"
    echo "${DEPLOYMENT_ID}" > "${SD}/deployment_id"
    write_state "PENDING_APPROVAL" "${DEPLOYMENT_ID}"
    tool_complete "create_deployment_state" "${DEPLOYMENT_ID}"
    echo "${DEPLOYMENT_ID}"
    ;;
  recover) deterministic_recover ;;
  rotate-key) rotate_key ;;
  events) lm="${1:-50}" ft="${2:-}" fv="${3:-}" fs="${4:-}"; echo "=== EVENTS (last ${lm}) ==="; query_events "${ft}" "${fv}" "${fs}" "${lm}"; echo "===============================" ;;
  reconstruct) log "Reconstructing from WAL..."; reconstruct_from_events; log "Done." ;;
  drift)
    log "=== DRIFT DETECTION ==="; [ -L "${CL}" ]||{ log "ERROR: No current"; exit 1; }
    echo "Config drift:"; if [ -L "${ED}/current.env" ]; then rh=""
      rh=$(sha256sum "${CL}/.env" 2>/dev/null|cut -d' ' -f1||echo "?")
      sh=$(sha256sum "$(readlink -f "${ED}/current.env")" 2>/dev/null|cut -d' ' -f1||echo "?")
      [ "${rh}" = "${sh}" ]&&echo "  ENV: OK"||echo "  ENV: DRIFT (${rh:0:12} != ${sh:0:12})"
    fi; echo "Runtime drift:"; for S in api web postgres redis nginx; do C="ayantaraz-${S}"
      docker inspect "${C}" &>/dev/null&&{ st=$(docker inspect --format='{{.State.Status}}' "${C}"); echo "  ${S}: ${st}"; }||echo "  ${S}: NOT RUNNING"
    done; echo ""; check_invariants&&echo "Invariants: PASS"||echo "Invariants: FAIL" ;;
  validate) VERSION="${1:-}"; [ -z "${VERSION}" ]&&[ -L "${CL}" ]&&VERSION=$(basename "$(readlink -f "${CL}")"); [ -n "${VERSION}" ]||{ log "ERROR: No version"; exit 1; }; validate_release "${RD}/${VERSION}"; validate_env_semantics "${RD}/${VERSION}/.env" ;;
  *) echo "Usage: ayan-deploy {cmd} [args]"
    echo ""; echo "State: state|trace|events|reconstruct|consistency"
    echo "Lock:  lock|lock-info|lock-recover"
    echo "Deploy: release|gate|activate|pass|fail|rollback|health"
    echo "Mgmt:  prune|pin|unpin|freeze|thaw|invariants|validate|drift"
    echo "Recov: recover|rotate-key"; exit 1 ;;
esac
