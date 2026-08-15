#!/usr/bin/env bash
# Fail if any tracked file exceeds size budget (matches pre-commit 500KB gate)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=lib/pick-python.sh
. "$(dirname "$0")/lib/pick-python.sh"

$PY - "$ROOT" << 'PY'
import subprocess
import sys
from pathlib import Path

root = Path(sys.argv[1])
max_bytes = 500 * 1024
files = subprocess.check_output(
    ["git", "ls-files", "-z"], cwd=root
).split(b"\0")
errors = []
for raw in files:
    if not raw:
        continue
    rel = raw.decode("utf-8", errors="replace")
    path = root / rel
    try:
        size = path.stat().st_size
    except OSError:
        continue
    if size > max_bytes:
        errors.append((rel, size // 1024))

if errors:
    for rel, kb in errors[:20]:
        print(f"LARGE TRACKED FILE: {rel} ({kb} KB > 500 KB)")
    if len(errors) > 20:
        print("... truncated (max 20)")
    print(f"{len(errors)} tracked file(s) exceed 500 KB")
    sys.exit(1)
print("Large tracked file check passed")
PY
