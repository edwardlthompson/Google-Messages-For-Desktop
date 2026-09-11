#!/usr/bin/env bash
# Local-only F-009 / Sacred examples / Scorecard+master alignment (no GitHub API).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/resolve-python.sh
. "$(cd "$(dirname "$0")" && pwd)/lib/resolve-python.sh"
exec "$PY" "$ROOT/scripts/lib/human_task_gmfd_waiting.py" "$ROOT"
