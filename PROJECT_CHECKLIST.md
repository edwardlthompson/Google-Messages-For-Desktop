# Project Checklist

> Status: 🔲 open · ✅ done · ❌ blocked.
> Project: **Google Messages for Desktop** · Stack: `node` · License: `MIT`

## Setup

- ✅ README is the product page (do not overwrite with `generate-project-readme.py`)
- ✅ Environment variables configured (`.env.example` mirrored; `.env` not committed)
- ✅ `docs/spec.md` and `docs/plan.md` filled for the bootstrap 0.21.0 milestone
- ✅ Agent-project-bootstrap catch-up to **v1.0.0** (Canon + Mixed; Sacred left intact)
- 🔲 Device smoke: first-run Defaults → Sign in → Verify
- 🔲 Pre-commit hooks installed (`pre-commit install`)

## Security & CI (defaults on)

- ✅ Conservative CI on `master` (ci, security, CodeQL, dependency-review, Dependabot)
- 🔲 Sign/notarize desktop artifacts
- ✅ Dependabot alerts enabled
- 🔲 Branch protection applied to `master` (optional HUMAN)
- ✅ `SECURITY.md` reporting channel present

## Agent adapters

- ✅ `AGENTS.md` reviewed for this product
- ✅ Adapters current (`bash scripts/bootstrap-lifecycle.sh --sync-adapters`)
  - `.cursor/rules/main.mdc`
  - `CLAUDE.md`
  - `.github/copilot-instructions.md`

## Next

1. `python scripts/agent-run.py validate-bootstrap --quick`
2. `python scripts/agent-run.py feature-gate --stack node`
3. Keep deferred workflows deferred (Scorecard, Release Please, Pages, stale, weekly-health)
4. Golden Path slices: say numbered items from the upgrade report to add BUILD_PLAN rows
