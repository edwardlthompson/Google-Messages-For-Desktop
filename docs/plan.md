# Implementation Plan

> Active work lives in `BUILD_PLAN.md`. This file is the SDD plan stub required by bootstrap validate.
> Status: 🔲 open · ✅ done · ❌ blocked.

## Milestone — Bootstrap standards (0.21.0)

| Task | Owner | Tests / fallback |
|------|-------|------------------|
| ✅ Template pin 0.17.0 → 0.21.0 | AGENT | `check-template-version-sync.sh` |
| ✅ Coach / tour / ideas + adapters | AGENT | `check-batch-commands.sh` + `check-agent-adapters.sh` |
| ✅ SDD stubs (`docs/spec.md`, this file) | AGENT | `validate-bootstrap.sh` REQUIRED list |

## Next feature

1. Copy `docs/features/_template.md` → `docs/features/{name}.md`
2. Lock the public API (Sequential)
3. Add unit tests before or with the implementation
4. Run `python scripts/agent-run.py watch-agent-gates --once --autofix`

If automated tests are not feasible, write the justification and fallback command in the feature spec before marking the BUILD_PLAN row ✅.
