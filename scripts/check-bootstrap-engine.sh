#!/usr/bin/env bash
# Unit tests for bootstrap lifecycle engine (stdlib unittest).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/resolve-python.sh
source "$ROOT/scripts/lib/resolve-python.sh"

export PYTHONPATH="$ROOT/scripts/lib${PYTHONPATH:+:$PYTHONPATH}"

# Product children do not vendor examples/; template integration tests stay upstream.
if [ -f branding/product.json ] && [ ! -d examples ]; then
  echo "OK   bootstrap-engine: product child without examples/ (full template suite skipped)"
  exec "$PY" -m unittest \
    tests.test_bootstrap_engine \
    tests.test_agent_adapters \
    tests.test_agent_run_env \
    tests.test_env_schema \
    tests.test_gate_hints \
    tests.test_changelog_unreleased \
    tests.test_conventional_commit \
    tests.test_doc_links \
    tests.test_validate_template_index \
    -q
fi

exec "$PY" -m unittest discover -s tests -p "test_*.py" -q
