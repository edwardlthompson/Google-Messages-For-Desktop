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

> **R-Audit-2026-07-29c** archived in COMPLETED_TASKS.md (AGENT/AUTO done; HUMAN residual).

> **Ship v1.5.0** tagged; Electron is primary shipping path (v1.7.0). Residual HUMAN: signed binaries + device smoke.

## Archived Sprints

| Sprint | Complete | Notes |
|--------|----------|-------|
| Sprint A — Phase 0 + §8 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint B — Phase 1 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint C — Phase 2 | 2026-07-29 | `COMPLETED_TASKS.md` |
| Sprint D — Phase 3-4 | 2026-07-29 | `COMPLETED_TASKS.md` |
| R-Audit-2026-07-29 | 2026-07-29 | AGENT/AUTO done; HUMAN residual |
| R-Audit-2026-07-29b | 2026-07-29 | Windows App Host harden + docs; HUMAN residual |
| Ship v1.5.0 | 2026-07-29 | Tag + Release notes; binaries HUMAN |
| R-Audit-2026-07-29c | 2026-07-29 | Electron first-run audit fixes; HUMAN residual |

---

## Post-audit residual HUMAN (R-Audit-2026-07-29c)

### Sequential

1. 🔲 [HUMAN] F-010 Sign/notarize desktop artifacts; smoke first-run Defaults → Sign in → Verify
2. 🔲 [HUMAN] Confirm CodeQL alert #1 clears after AGENT host-parse fix on `master`
3. 🔲 [HUMAN] Run `npm run release:windows`; upload builds as appropriate

### Parallel

<!-- parallel_exception: residual HUMAN-only; no AGENT parallel scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |

### Human & device

1. 🔲 [HUMAN] Device smoke: onboarding checklist, sign-in, `tel:`/`sms:` compose

---

## Sprint E — Ongoing maintenance

### Sequential

1. 🔲 [AGENT] Dependabot / security triage per `docs/SECURITY_TRIAGE.md` when alerts appear
2. 🔲 [HUMAN] GitHub Releases when packaging updates are needed (Electron via Actions or local)
3. 🔲 [AGENT] Template update checks via `scripts/check-template-updates.sh` (stdout)
4. 🔲 [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
5. 🔲 [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
6. 🔲 [HUMAN] Keep deferred workflows deferred unless explicitly requested
7. 🔲 [HUMAN] Optional: bump `engines.node` after packaging smoke
8. 🔲 [DEFERRED] F-009 Wire auto-update publish + signing before enabling launch checks

### Parallel

<!-- parallel_exception: maintenance lane is reactive; no standing parallel AGENT scopes -->

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None — see exception* | — | — |
