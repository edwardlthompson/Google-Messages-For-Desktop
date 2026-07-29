# Agent Memory

> Update only at milestone boundaries.

## Project

- **Repo:** `edwardlthompson/Google-Messages-For-Desktop` (fork of `kelyvin/Google-Messages-For-Desktop`)
- **Product:** Windows Chromium App Host + mac/linux Nativefier for Google Messages Web (`1.5.0`)
- **Posture:** Maintenance mode — no new product features
- **Template pin:** `agent-project-bootstrap` **0.15.1** (surgical child)
- **Stack:** `node` / `foss` — root packaging only; no `examples/`
- **Default branch:** `master`
- **Lockfile:** `yarn.lock` (npm CLI OK)
- **Compute:** This Computer only — Cloud Agents rejected

## Milestone: Phase 0 complete (2026-07-29)

- Wrote `docs/BOOTSTRAP_ALIGNMENT.md`
- PR #1 Phase 0 docs; local handoff recorded

## Milestone: Sprint B–D bring-up (2026-07-29)

- §8 decisions locked in `DECISION_LOG.md`
- FOSS agent surface, scripts, security docs, conservative CI on `master`
- `LICENSE` dual copyright; `modules/node/MODULE.md` Nativefier-adapted
- Deferred optional workflows per H6
- `bash scripts/validate-bootstrap.sh --quick` **passed** (Windows Git Bash; `BOOTSTRAP_CHECK_JOBS=2`)

## Milestone: R-Audit-2026-07-29

- Gates: validate-bootstrap / feature-gate(node) / hygiene / README health **PASS**
- AGENT fixed F-003…F-007 (package.json fork URLs, CONTRIBUTING, threat model, third-party licenses, gitignore)
- HUMAN residual: F-001 Dependabot alerts; F-002 commit/push for PR CI
- Dependabot/CodeQL remote alerts not enabled yet (`gh` 403 / no analysis)

## Milestone: Windows sms/tel + 1.5.0 packaging (2026-07-29)

- `inject/compose-from-protocol.js` + `scripts/windows/patch-protocol-handlers.js`
- Inno Setup under `packaging/windows/`; `npm run release:windows`
- `sms:` and `tel:` both mean **new text** (not voice)
- HUMAN: local `release:windows`, smoke-test, tag/release

## Milestone: /ship v1.5.0 (2026-07-29)

- Pre-release gate **PASS** on `master` after node-stack adaptations + empty yarn.lock
- Merged PR #1; tagged **v1.5.0**; Release: https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases/tag/v1.5.0
- CI / Security Scan / CodeQL green; Dependabot Critical/High = 0
- Regress: upgrade simulation PASS; no SBOM/binary assets on Release yet (HUMAN upload)
- Pages N/A

## Milestone: /push prepare v1.5.0 (2026-07-29)

- Commit `3d68e97` on `cursor/bootstrap-alignment-378a` pushed to origin
- README documents App Host + pin + tray + security notes
- Local pre-release gates PASS; GitHub **CI hygiene PASS**; Trivy + Dependency Review **FAIL** (HUMAN: graph + Nativefier CVEs)
- No Release Please PR to merge

## Milestone: R-Audit-2026-07-29b (Windows App Host)

- Gates: validate-bootstrap / feature-gate(multi) / hygiene / README health **PASS**
- Hardened host: Messages URL allowlist, ephemeral CDP port file, pipe token, `smsto`/`callto` parse, `GMFD_SKIP_SFTA`
- Docs synced to App Host (MODULE, THREAT_MODEL, CONTRIBUTING, START_HERE, AGENTS, THIRD_PARTY)
- HUMAN residual: Dependabot alerts, commit/push, engines bump, re-pin taskbar

## Provenance note

- `package.json` repository/bugs/homepage retargeted to `edwardlthompson/Google-Messages-For-Desktop`; upstream `kelyvin/...` documented in CONTRIBUTING + KB-001
