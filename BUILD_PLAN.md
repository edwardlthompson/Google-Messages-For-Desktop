# BUILD_PLAN — Google Messages for Desktop

> Prioritized task board with owner labels. **Completed sprints:** `COMPLETED_TASKS.md`.

## Owner Label Legend

| Label   | Owner           | When to use                                                |
| ------- | --------------- | ---------------------------------------------------------- |
| `AGENT` | Cursor Agent    | Code, docs, scaffolding, tests, CI config                  |
| `HUMAN` | Human developer | Approvals, credentials, GitHub settings, product decisions |
| `ADB`   | Human (Android) | N/A for this repo                                          |
| `AUTO`  | CI/scripts/bots | GitHub Actions, Dependabot, pre-commit, update checker     |
## Status markers

| Marker | State   | Agent action                                                          |
| ------ | ------- | --------------------------------------------------------------------- |
| 🔲     | Open    | Default for new tasks; work or leave queued                           |
| ✅     | Done    | Replace 🔲 when complete; archive sprint rows to `COMPLETED_TASKS.md` |
| ❌     | Blocked | Replace 🔲 when blocked; add brief reason after the description       |
**Task format:** `🔲 [OWNER] Description` · done: `✅ [OWNER] Description` · blocked: `❌ [OWNER] Description — reason`

> **Sprint G — Desktop product backlog** archived in COMPLETED_TASKS.md @ `2338c31`.

> **Sprint F — Golden Path on Electron** archived in COMPLETED_TASKS.md @ `2338c31`.

> **HUMAN automation + donations-updates** archived in COMPLETED_TASKS.md @ `2338c31`.

> **HUMAN_BACKLOG device + GitHub** archived in COMPLETED_TASKS.md @ `2338c31` (working tree).

> **Ship v1.9.0** tagged @ `73290d1`. Residual: unsigned until `CSC_LINK` secrets (F-009).

> **Ship v1.8.1** archived in COMPLETED_TASKS.md @ `6adf8c6`. Residual: F-009 signing.

> **R-Audit-2026-08-14** archived in COMPLETED_TASKS.md.

> **Ship v1.8.0** tagged + unsigned Electron artifacts on GitHub Release. Residual: F-009 signing.

> **R-Audit-2026-07-29c** archived in COMPLETED_TASKS.md.

## Archived Sprints

| Sprint | Complete | Notes |
|--------|----------|-------|
| Sprint A — Phase 0 + §8 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint B — Phase 1 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint C — Phase 2 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint D — Phase 3-4 | 2026-07-29 | `COMPLETED_TASKS.md` |
| R-Audit-2026-07-29 | 2026-07-29 | AGENT/AUTO done |
| R-Audit-2026-07-29b | 2026-07-29 | Windows App Host harden + docs |
| Ship v1.5.0 | 2026-07-29 | Tag kept; empty GitHub Release deleted 2026-09-02 |
| R-Audit-2026-07-29c | 2026-07-29 | Electron first-run audit fixes |
| Ship v1.7.0 | 2026-07-29 | Electron multi-platform + unsigned CI artifacts |
| Ship v1.7.1 | 2026-07-30 | Sign-in auto-complete + package verify + NativeImage |
| Ship v1.8.0 | 2026-07-30 | Windows OS notify + tray unread |
| R-Audit-2026-08-14 | 2026-08-14 | AGENT/AUTO done |
| Ship v1.8.1 | 2026-08-14 | Electron 41.10.3 + 0.17.0; unsigned CI artifacts |
| Ship v1.9.0 | 2026-08-22 | Donate + GitHub installer checks; unsigned CI artifacts |
| HUMAN automation + donations-updates | 2026-09-02 | `COMPLETED_TASKS.md` |
| Sprint E maintenance AGENT rows | 2026-09-02 | `COMPLETED_TASKS.md` |
| Sprint F — Golden Path on Electron | 2026-09-02 | `COMPLETED_TASKS.md` |
| Sprint G — Desktop product backlog | 2026-09-02 | `COMPLETED_TASKS.md` |
| HUMAN_BACKLOG device + GitHub | 2026-09-02 | `COMPLETED_TASKS.md` |
---

## Sprint E — Ongoing maintenance

### Sequential

1. 🔲 [HUMAN] F-009 Wire auto-update publish + signing before enabling launch checks

### Parallel

<!-- parallel_exception: maintenance lane is reactive; no standing parallel AGENT scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |
