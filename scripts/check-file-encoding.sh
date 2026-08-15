#!/usr/bin/env bash
# Fail if text files use UTF-16 or NUL-byte corruption (must be UTF-8)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=lib/pick-python.sh
. "$(dirname "$0")/lib/pick-python.sh"
"$PY" "$(dirname "$0")/check-file-encoding.py" "$ROOT" "$@"
