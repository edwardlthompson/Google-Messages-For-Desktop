#!/usr/bin/env bash
# Count open Critical/High Dependabot alerts (paginated).
# Usage: scripts/count-critical-high-dependabot.sh
# Exit 0 prints count to stdout; exit 1 on API/auth error.
set -euo pipefail

resolve_gh() {
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

GH_BIN="$(resolve_gh || true)"
if [ -z "${GH_BIN:-}" ]; then
  echo "ERROR: gh CLI required" >&2
  exit 1
fi

REPO="${GITHUB_REPO:-$("$GH_BIN" repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
if [ -z "$REPO" ]; then
  echo "ERROR: gh auth required" >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then PY=python3
elif command -v python >/dev/null 2>&1; then PY=python
else PY=python3; fi

COUNT="$("$PY" - "$REPO" "$GH_BIN" << 'PY'
import json, subprocess, sys

repo = sys.argv[1]
gh = sys.argv[2]
proc = subprocess.run(
    [
        gh,
        "api",
        "--paginate",
        f"repos/{repo}/dependabot/alerts?state=open&per_page=100",
    ],
    capture_output=True,
    text=True,
)
if proc.returncode != 0:
    print(proc.stderr or proc.stdout or "error", file=sys.stderr)
    raise SystemExit(1)

raw = (proc.stdout or "").strip()
if not raw:
    print(0)
    raise SystemExit(0)

alerts: list = []
decoder = json.JSONDecoder()
idx = 0
while idx < len(raw):
    while idx < len(raw) and raw[idx].isspace():
        idx += 1
    if idx >= len(raw):
        break
    obj, end = decoder.raw_decode(raw, idx)
    if isinstance(obj, list):
        alerts.extend(obj)
    elif isinstance(obj, dict):
        alerts.append(obj)
    idx = end

total = 0
for a in alerts:
    sev = (a.get("security_vulnerability") or {}).get("severity", "").lower()
    if not sev:
        sev = (a.get("security_advisory") or {}).get("severity", "").lower()
    if sev in ("critical", "high"):
        total += 1
print(total)
PY
)"

echo "$COUNT"
