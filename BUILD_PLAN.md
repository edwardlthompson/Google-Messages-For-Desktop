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

Product is in **maintenance mode**. Active work = bootstrap alignment + ongoing hygiene — not feature Golden Path.

> **Ship v1.5.0** tagged on `master` (`v1.5.0`); CI/Security/CodeQL green; Dependabot Critical/High = 0.  
> **R-Audit / Sprint A–D / W AGENT** archived in COMPLETED_TASKS.md. Residual HUMAN: attach Windows binaries + device smoke.

## Archived Sprints

| Sprint | Complete | Notes |
|--------|----------|-------|
| Sprint A — Phase 0 + §8 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint B — Phase 1 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint C — Phase 2 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint D — Phase 3-4 | 2026-07-29 | `COMPLETED_TASKS.md` |
| R-Audit-2026-07-29 | 2026-07-29 | AGENT/AUTO done; HUMAN residual |
| R-Audit-2026-07-29b | 2026-07-29 | Windows App Host harden + docs; HUMAN residual |
| Ship v1.5.0 | 2026-07-29 | Tag + GitHub Release notes; binaries still HUMAN |

---

## Post-ship v1.5.0 — residual HUMAN

### Sequential

1. 🔲 [HUMAN] Run `npm run release:windows`; upload Setup EXE + portable zip to GitHub Release `v1.5.0`
2. 🔲 [HUMAN] F-011 optional: bump `engines.node` after packaging smoke

### Parallel

<!-- parallel_exception: residual HUMAN-only; no AGENT parallel scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device (after automation)

1. 🔲 [HUMAN] Smoke-test `tel:`/`sms:`; confirm Default apps lists Google Messages
2. 🔲 [HUMAN] Re-pin Messages window; confirm taskbar identity ≠ Google Chrome
3. 🔲 [HUMAN] Pair phone and verify compose banner / Start chat fill

---

## Sprint E — Ongoing maintenance

### Sequential

1. 🔲 [AGENT] Dependabot / security triage per `docs/SECURITY_TRIAGE.md` when alerts appear
2. 🔲 [HUMAN] Nativefier rebuilds / GitHub Releases when packaging updates are needed
3. 🔲 [AGENT] Template update checks via `scripts/check-template-updates.sh` (stdout)
4. 🔲 [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
5. 🔲 [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
6. 🔲 [HUMAN] Keep deferred workflows deferred unless explicitly requested (Scorecard, Release Please, Pages, stale, weekly-health)

### Parallel

<!-- parallel_exception: maintenance lane is reactive (alerts/releases); no standing parallel AGENT scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device (after automation)

1. 🔲 [HUMAN] Clear items in `HUMAN_BACKLOG.md` as completed
