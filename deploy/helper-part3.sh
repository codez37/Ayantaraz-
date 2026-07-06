check_invariants(){
  local er=0
  if [ -L "${CL}" ]; then local t; t="$(readlink -f "${CL}" 2>/dev/null||echo "")"
    [ -n "${t}" ] && [ -d "${t}" ]||{ event "ERROR" "INVARIANT_FAIL" "reason=current_invalid"; er=$((er+1)); }
    [ -f "${t}/.env" ]||{ event "ERROR" "INVARIANT_FAIL" "reason=current_no_env"; er=$((er+1)); }
  fi
  if [ -L "${ED}/current.env" ]; then local t; t="$(readlink -f "${ED}/current.env" 2>/dev/null||echo "")"
    [ -n "${t}" ] && [ -f "${t}" ]||{ event "ERROR" "INVARIANT_FAIL" "reason=env_broken"; er=$((er+1)); }
  fi
  [ -f "${SF}" ] && grep -q 'STATE=' "${SF}" 2>/dev/null||{ event "ERROR" "INVARIANT_FAIL" "reason=state_corrupt"; er=$((er+1)); }
  detect_forks||er=$((er+1))
  [ "${er}" -gt 0 ]&&{ event "ERROR" "INVARIANT_SUMMARY" "errors=${er}"; return 1; }
  event "INFO" "INVARIANT_PASS"; return 0
}
run_gate(){
  local rd="$1" gs="${SD}/gate_state"; log "=== STAGED GATE ==="
  local s; s=$(grep '^S1=' "${gs}" 2>/dev/null|cut -d= -f2||echo "")
  if [ "${s}" != "PASS" ]; then log "  [1/4] Structural..."
    if validate_release "${rd}"; then echo "S1=PASS">"${gs}"; event "INFO" "GATE_S1_PASS"
    else echo "S1=FAIL">"${gs}"; event "ERROR" "GATE_S1_FAIL"; log "  BLOCKED S1"; return 1; fi
  else log "  [1/4] Structural: CACHED"; fi
  s=$(grep '^S2=' "${gs}" 2>/dev/null|cut -d= -f2||echo "")
  if [ "${s}" != "PASS" ]; then log "  [2/4] Semantic..."
    if validate_env_semantics "${rd}/.env"; then echo "S2=PASS">>"${gs}"; event "INFO" "GATE_S2_PASS"
    else echo "S2=FAIL">>"${gs}"; event "ERROR" "GATE_S2_FAIL"; log "  BLOCKED S2"; return 1; fi
  else log "  [2/4] Semantic: CACHED"; fi
  s=$(grep '^S3=' "${gs}" 2>/dev/null|cut -d= -f2||echo "")
  if [ "${s}" != "PASS" ]; then log "  [3/4] Invariants..."
    if check_invariants; then echo "S3=PASS">>"${gs}"; event "INFO" "GATE_S3_PASS"
    else echo "S3=FAIL">>"${gs}"; event "ERROR" "GATE_S3_FAIL"; log "  BLOCKED S3"; return 1; fi
  else log "  [3/4] Invariants: CACHED"; fi
  s=$(grep '^S4=' "${gs}" 2>/dev/null|cut -d= -f2||echo "")
  if [ "${s}" != "PASS" ]; then log "  [4/4] Preflight..."
    local pf=0; docker info &>/dev/null||{ log "    FAIL: Docker down"; pf=$((pf+1)); }
    local av; av=$(df /opt/ayan-taraz --output=avail 2>/dev/null|tail -1|tr -d ' '||echo 0)
    [ "${av}" -gt 1048576 ] 2>/dev/null||{ log "    FAIL: Disk<1GB"; pf=$((pf+1)); }
    if [ "${pf}" -gt 0 ]; then echo "S4=FAIL">>"${gs}"; event "ERROR" "GATE_S4_FAIL" "errors=${pf}"; log "  BLOCKED S4"; return 1; fi
    echo "S4=PASS">>"${gs}"; event "INFO" "GATE_S4_PASS"
  else log "  [4/4] Preflight: CACHED"; fi
  rm -f "${gs}"; event "INFO" "GATE_PASS"; log "  GATE: ALL PASSED"; return 0
}
graceful_drain(){
  event "INFO" "DRAIN_STARTED"
  if docker inspect ayantaraz-nginx &>/dev/null; then
    if docker exec ayantaraz-nginx nginx -s quit 2>/dev/null; then
      event "INFO" "DRAIN_INITIATED"
    else
      event "WARN" "DRAIN_SKIP_NOQUIT"
    fi
  else
    event "INFO" "DRAIN_SKIP"
    return 0
  fi
  
  local el=0
  while [ ${el} -lt ${DT} ]; do
    if docker inspect ayantaraz-nginx &>/dev/null; then
      event "INFO" "DRAIN_COMPLETE" "waited=${el}s method=stopped"
      log "  Drain: ${el}s"
      return 0
    fi
    local ac
    if ac=$(docker exec ayantaraz-nginx sh -c 'wget -qO- http://127.0.0.1/nginx_status 2>/dev/null|grep "Active"|awk "{print \$3}"' 2>/dev/null); then
      if [ "${ac}" = "0" ]; then
        event "INFO" "DRAIN_COMPLETE" "waited=${el}s method=active_zero"
        log "  Drain: ${el}s"
        return 0
      fi
    else
      event "WARN" "DRAIN_HEALTHCHECK_FAIL"
    fi
    sleep ${DP}
    el=$((el+DP))
  done
  event "WARN" "DRAIN_TIMEOUT"
  log "  Drain: TIMEOUT. Force stop..."
  if docker stop ayantaraz-nginx; then
    sleep 1
    event "INFO" "DRAIN_FORCESTOP"
  else
    event "WARN" "DRAIN_FORCESTOP_FAIL"
  fi
}
restore_traffic(){ event "INFO" "RESTORE_STARTED"; [ -L "${CL}" ]&&{ cd "${CL}"; if docker compose start nginx; then event "INFO" "RESTORE_NGINX_STARTED"; else event "WARN" "RESTORE_NGINX_FAIL"; fi; cd /; }; event "INFO" "RESTORE_COMPLETE"; }
runtime_check(){
  local er=0; event "INFO" "RUNTIME_CHECK_START"
  if [ -L "${CL}" ]; then local t; t="$(readlink -f "${CL}" 2>/dev/null||echo "")"; [ -n "${t}" ] && [ -d "${t}" ]||{ event "ERROR" "RUNTIME_FAIL" "reason=current_broken"; er=$((er+1)); }
  else event "ERROR" "RUNTIME_FAIL" "reason=no_current"; er=$((er+1)); fi
  local ev; ev=$(cat "${D}/VERSION" 2>/dev/null||echo "")
  [ -L "${CL}" ]&&{ local av; av=$(basename "$(readlink -f "${CL}" 2>/dev/null||echo "")"||echo ""); [ "${ev}" = "${av}" ]||{ event "ERROR" "RUNTIME_FAIL" "reason=version_mismatch"; er=$((er+1)); }; }
  local hc; hc=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null||echo "000")
  [ "${hc}" = "200" ]||{ event "ERROR" "RUNTIME_FAIL" "reason=health_fail http=${hc}"; er=$((er+1)); }
  for S in api web postgres redis nginx; do local C="ayantaraz-${S}"
    docker inspect "${C}" &>/dev/null&&{ local rc; rc=$(docker inspect --format='{{.RestartCount}}' "${C}" 2>/dev/null||echo 0); [ "${rc}" -lt 3 ] 2>/dev/null||event "WARN" "RUNTIME_DRIFT" "reason=restart_loop c=${C} n=${rc}"; }
  done
  [ "${er}" -gt 0 ]&&{ event "ERROR" "RUNTIME_CHECK_FAIL" "errors=${er}"; return 1; }
  event "INFO" "RUNTIME_CHECK_PASS"; return 0
}
release_score(){ local d="$1" sc=0; validate_release "${d}" 2>/dev/null&&sc=$((sc+4)); validate_env_semantics "${d}/.env" 2>/dev/null&&sc=$((sc+3)); [ -f "${d}/.env" ] && [ -f "${d}/VERSION" ]&&sc=$((sc+2)); echo "${sc}"; }
deterministic_recover(){
  gen_trace; tx_begin "RECOVERY"; event "INFO" "RECOVERY_STARTED"; log "=== DETERMINISTIC RECOVERY ==="
  local best="" bsc=-1
  for R in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r); do
    local rt="${RD}/${R}"; [ -f "${rt}/.env" ] && [ -f "${rt}/docker-compose.yml" ] && [ -f "${rt}/VERSION" ]||continue
    local sc; sc=$(release_score "${rt}"); event "INFO" "RECOVERY_CANDIDATE" "version=${R} score=${sc}"; log "  ${R} score=${sc}"
    if [ "${sc}" -gt "${bsc}" ]||{ [ "${sc}" -eq "${bsc}" ] && [ "${R}" > "${best}" ]; }; then bsc="${sc}"; best="${R}"; fi
  done
  if [ -z "${best}" ]; then tx_rollback "RECOVERY" "no_valid_release"; log "ERROR: NO valid release. Manual intervention required."; write_state "RECOVERY_FAILED" ""; exit 1; fi
  log "  Best: ${best} (score=${bsc})"; acquire_lock
  local rt="${RD}/${best}"; validate_env_semantics "${rt}/.env"||{ for R2 in $(ls -1d "${RD}"/*/ 2>/dev/null|xargs -I{} basename {}|sort -r); do [ "${R2}" = "${best}" ]&&continue; [ -f "${RD}/${R2}/.env" ]&&{ cp "${RD}/${R2}/.env" "${rt}/.env"; break; }; done; }
  write_state "ACTIVATING" "${best}"; graceful_drain
  [ -L "${CL}" ]&&{ cd "${CL}"; docker compose down 2>/dev/null||true; cd /; }
  ln -snf "${RD}/${best}" "${CL}"; echo "${best}">"${D}/VERSION"
  cd "${CL}"; docker compose pull 2>/dev/null||true; docker compose up -d --build; cd /; restore_traffic; sleep 5
  local hc; hc=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null||echo "000")
  if [ "${hc}" = "200" ]; then write_state "ACTIVE" "${best}"; tx_commit "RECOVERY" "${best}"; log "Recovery complete: ${best}"
  else write_state "FAILED" "${best}"; tx_rollback "RECOVERY" "health_fail" "${best}"; log "Recovery failed: HTTP ${hc}"; fi
  release_lock
}
validate_rollback_target(){ validate_release "$1"||return 1; validate_env_semantics "$1/.env"||return 1; return 0; }
is_pinned(){ [ -f "${PF}" ] && grep -qx "$1" "${PF}" 2>/dev/null; }
pin_release(){ touch "${PF}"; is_pinned "$1"&&return 0; echo "$1">>"${PF}"; event "INFO" "PIN" "version=$1"; }
unpin_release(){ [ -f "${PF}" ]||return 0; grep -v "^$1$" "${PF}">"${PF}.tmp" 2>/dev/null||true; mv "${PF}.tmp" "${PF}" 2>/dev/null||true; event "INFO" "UNPIN" "version=$1"; }
is_frozen(){ [ -f "${FR}" ]; }
