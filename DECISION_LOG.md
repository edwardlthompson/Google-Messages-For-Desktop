# Decision Log

## 2026-07-29 — Bootstrap alignment §8 locked (Phase 0→1+)

- **Status:** Accepted
- **Context:** Phase 0 gap analysis in `docs/BOOTSTRAP_ALIGNMENT.md`; HUMAN accepted agent-proposed logical/ethical defaults and authorized Sprint B→D on This Computer.
- **Decisions:**
  - **H1:** MIT `LICENSE` with `Copyright (c) 2018-2023 Kelvin Nguyen` and `Copyright (c) 2026 Edward L. Thompson`
  - **H2:** Keep default branch **`master`**; adapt workflows
  - **H3:** Keep **`yarn.lock`**; do not migrate to npm lockfile; npm CLI OK for scripts
  - **H4:** `.cursor/stack-selection.json` → `stack: node`, `distribution_tier: foss`; **no** `examples/` vendor
  - **H5:** CI = hygiene + validate-bootstrap + CodeQL JS + dependency-review + Dependabot; **no** Nativefier builds in CI
  - **H6:** Defer Scorecard, Release Please, Pages, stale, weekly-health, automerge PAT
  - **H7:** Adopt FOSS fail-open Cursor hooks (Desktop only)
  - **H8:** Alignment/maintenance tooling only — no feature revival / Electron rewrite
  - **H9:** `CODEOWNERS` → `* @edwardlthompson`
  - **H10:** **No** `init-project.sh` — surgical copy only
  - **H11:** This Computer only — no Cursor Cloud Agents
- **Consequences:** Surgical bring-up from `agent-project-bootstrap` v0.15.1; product README/scripts preserved; dual copyright LICENSE added.

## 2026-07-29 — Local handoff (no Cloud Agents)

- **Status:** Accepted
- **Context:** HUMAN directed project work to local Cursor Desktop.
- **Decision:** All further bootstrap alignment and maintenance agent work runs on Cursor Desktop (This Computer).
- **Consequences:** No `.cursor/environment.json` cloud environments; FOSS Cursor integrations only.
