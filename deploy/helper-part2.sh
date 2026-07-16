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