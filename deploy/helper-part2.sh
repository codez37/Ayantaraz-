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
  # TTL check: if lock exists and age > 10min, force release
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
  [ -f "${d}/infra/docker/Dockerfile.api" ]||{ log "  FAIL: no api df"; er=$((er+1)); }
  [ -f "${d}/infra/docker/Dockerfile.web" ]||{ log "  FAIL: no web df"; er=$((er+1)); }
  [ -s "${d}/.env" ]||{ log "  FAIL: .env empty"; er=$((er+1)); }
  return ${er}
}
