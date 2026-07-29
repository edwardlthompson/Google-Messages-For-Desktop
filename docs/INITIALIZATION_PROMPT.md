# Initialization Prompt — Maintenance Alignment (Not Fresh Bootstrap)

> This repository is an **existing product** (Google Messages for Desktop) with surgical agent-project-bootstrap alignment.  
> **Do not** run `scripts/init-project.sh` / `init-project.ps1`.  
> **Do not** pretend this is Sprint 0 greenfield.

## When an agent lands here

1. Read `docs/START_HERE.md` → `docs/CURSOR_MODES.md` → `AGENTS.md`
2. Read `BUILD_PLAN.md` Sequential lane
3. Respect locked decisions in `docs/BOOTSTRAP_ALIGNMENT.md` §8 and `DECISION_LOG.md`
4. Stack: `.cursor/stack-selection.json` → `"stack": "node"`, `"distribution_tier": "foss"`
5. No `examples/**` vendor; Golden Path is **root Nativefier packaging scripts**

## Locked high-risk defaults

| Item | Value |
|------|--------|
| LICENSE | MIT; Copyright 2018-2023 Kelvin Nguyen; Copyright 2026 Edward L. Thompson |
| Default branch | `master` |
| Lockfile | Keep `yarn.lock`; npm CLI OK |
| CI | Hygiene/validate/CodeQL/dependency-review/Dependabot; no Nativefier builds in CI |
| Optional workflows | Deferred (Scorecard, Release Please, Pages, stale, weekly-health, automerge PAT) |
| Compute | This Computer only — no Cloud Agents |
| Product scope | Alignment/maintenance only — no feature revival |

## If asked to “bootstrap”

Interpret as: continue alignment/maintenance per `BUILD_PLAN.md`, not template `init-project`.
