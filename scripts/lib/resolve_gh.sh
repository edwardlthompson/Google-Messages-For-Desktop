# shellcheck shell=bash
# Resolve `gh` for Git Bash / WSL where PATH entries contain spaces.
# Sets GH_BIN. Source from other scripts: . "$(dirname "$0")/lib/resolve_gh.sh"

resolve_gh_bin() {
  if command -v gh >/dev/null 2>&1; then
    command -v gh
    return 0
  fi
  local c
  for c in \
    "/mnt/c/Program Files/GitHub CLI/gh.exe" \
    "/c/Program Files/GitHub CLI/gh.exe" \
    "/c/Program Files (x86)/GitHub CLI/gh.exe" \
    "${LOCALAPPDATA:-}/Programs/GitHub CLI/gh.exe"; do
    if [ -n "$c" ] && [ -x "$c" ]; then
      printf '%s\n' "$c"
      return 0
    fi
  done
  return 1
}

GH_BIN="$(resolve_gh_bin || true)"
if [ -z "${GH_BIN:-}" ]; then
  echo "ERROR: gh CLI required (https://cli.github.com/)" >&2
  return 1 2>/dev/null || exit 1
fi
