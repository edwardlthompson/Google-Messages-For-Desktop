#!/usr/bin/env bash
# Run Waiting-on-a-person HUMAN automations for this Electron child.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/resolve-python.sh
. "$(cd "$(dirname "$0")" && pwd)/lib/resolve-python.sh"

fail=0
run_row() {
  local task="$1"
  if ! "$PY" "$ROOT/scripts/lib/human_task_automation.py" --root "$ROOT" --owner HUMAN --task "$task"; then
    fail=1
  fi
}

run_row "F-009 Wire auto-update publish + signing before enabling launch checks"
run_row "Sacred: review \`examples/node\` from parent 1.4.0 — never blind-overwrite Electron (item 18)"
run_row "Sacred: review \`examples/python\` from parent 1.4.0 — do not vendor (item 19)"
run_row "Sacred: review \`examples/web\` from parent 1.4.0 — do not vendor (item 20)"
run_row "Enable OpenSSF Scorecard workflow + align GitHub branch-protection check names with default branch \`master\`"

exit "$fail"
