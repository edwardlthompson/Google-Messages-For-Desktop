# Shared PY picker. Skip Windows Store aliases (they hang on --version).
# Usage: . "$(dirname "$0")/lib/pick-python.sh"
pick_python() {
  local c p
  for c in python3 python; do
    while IFS= read -r p; do
      [ -n "$p" ] || continue
      case "$p" in
        *WindowsApps*) continue ;;
      esac
      PY="$p"
      return 0
    done < <(type -aP "$c" 2>/dev/null || true)
  done
  if command -v python >/dev/null 2>&1; then
    PY=python
    return 0
  fi
  PY=python3
}

pick_python
