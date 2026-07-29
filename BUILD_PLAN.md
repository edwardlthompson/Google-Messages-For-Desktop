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

> **R-Audit-2026-07-29b** AGENT/AUTO archived in COMPLETED_TASKS.md; residual HUMAN below. See `CODE_REVIEW.md`.  
> **R-Audit-2026-07-29** archived in COMPLETED_TASKS.md (AGENT/AUTO). Residual HUMAN rows below.  
> **Sprint A–D** archived in COMPLETED_TASKS.md @ local bring-up 2026-07-29.

## Archived Sprints

| Sprint | Complete | Notes |
|--------|----------|-------|
| Sprint A — Phase 0 + §8 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint B — Phase 1 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint C — Phase 2 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint D — Phase 3-4 | 2026-07-29 | `COMPLETED_TASKS.md` |
| R-Audit-2026-07-29 | 2026-07-29 | AGENT/AUTO done; HUMAN residual |
| R-Audit-2026-07-29b | 2026-07-29 | Windows App Host harden + docs; HUMAN residual |

---

> **R-Audit-2026-07-29b** AGENT/AUTO archived in COMPLETED_TASKS.md @ local `/audit` 2026-07-29. Residual HUMAN below.

## R-Audit-2026-07-29b — residual HUMAN

### Sequential

1. 🔲 [HUMAN] F-003: Enable Dependabot alerts + secret scanning; commit/push so CI/CodeQL run
2. 🔲 [HUMAN] F-011: Optional `engines.node` bump after packaging smoke

### Parallel

<!-- parallel_exception: residual HUMAN-only; no AGENT parallel scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device (after automation)

1. 🔲 [HUMAN] F-003 / F-011 as above
2. 🔲 [HUMAN] Re-pin Messages window after host rebuild; confirm taskbar identity ≠ Google Chrome

---

## Sprint W — Windows sms/tel + public release 1.5.0

### Sequential

1. ✅ [AGENT] Inject compose helper + post-Nativefier protocol patch; wire `windows` / `windows:tray`
2. ✅ [AGENT] Inno Setup packaging + `release:windows` scripts
3. ✅ [AGENT] Bump `1.5.0`, CHANGELOG, README, `docs/WINDOWS_PROTOCOL_HANDLERS.md`
4. 🔲 [HUMAN] Install Inno Setup 6 if needed; run `npm run release:windows`; smoke-test `start sms:+1…` / `tel:+1…`
5. 🔲 [HUMAN] Commit/push; tag `v1.5.0`; `gh release create` with Setup EXE + portable zip
6. 🔲 [HUMAN] Enable Dependabot alerts (F-001) if still disabled

### Parallel

<!-- parallel_exception: packaging pipeline is sequential (nativefier → patch → Inno) -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device (after automation)

1. 🔲 [HUMAN] Confirm Default apps link-type UI lists Google Messages for sms/tel
2. 🔲 [HUMAN] Pair phone and verify compose banner / Start chat fill

---

## R-Audit-2026-07-29 — residual HUMAN

### Sequential

1. 🔲 [HUMAN] F-001: Enable Dependabot alerts + secret scanning on GitHub
2. 🔲 [HUMAN] F-002: Commit/push alignment + audit + 1.5.0 packaging so PR/CI can run

### Parallel

<!-- parallel_exception: residual HUMAN-only gate; no AGENT parallel scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device (after automation)

1. 🔲 [HUMAN] F-001 / F-002 as above
2. 🔲 [HUMAN] F-008 optional: bump `engines.node` after local Nativefier smoke on target LTS

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
