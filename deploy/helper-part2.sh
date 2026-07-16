read_state(){
  STATE="IDLE"; STATE_TIME=""; STATE_VER=""; TID="${TRACE_ID:-}"
  if [ -f "${SF}" ]; then while IFS== read -r k v; do case "$k" in
    STATE) STATE="$v" ;;
  esac; done < "${SF}" 2>/dev/null||true; fi
}