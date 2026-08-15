# Agent Memory

> Update only at milestone boundaries.

## Project

- **Repo:** `edwardlthompson/Google-Messages-For-Desktop` (fork of `kelyvin/Google-Messages-For-Desktop`)
- **Product:** Electron desktop app for Google Messages Web (**v1.8.1** shipped); Chromium App Host / Nativefier = legacy
- **Posture:** Active Electron first-run + multi-platform packaging; bootstrap FOSS alignment retained
- **Template pin:** `agent-project-bootstrap` **0.17.0** (surgical child; product semver is 1.8.1)
- **Stack:** `node` / `foss` — root packaging + `electron/`; no `examples/`
- **Default branch:** `master`
- **Lockfile:** root `yarn.lock`; Electron `electron/package-lock.json` (+ `brace-expansion@5.0.8` override)
- **Compute:** This Computer only — Cloud Agents rejected
- **Donate:** Venmo `https://venmo.com/code?user_id=1857304970395648420`

## Milestone: /ship v1.8.1 (2026-08-14)

- Electron 41.10.3 + `fast-uri@3.1.5` + `js-yaml@4.3.1`; session permission allowlist; hide-content catch
- Template pin **0.17.0** branding/codex-review surface committed with the product tag
- HUMAN residual: sign/notarize + toast/tray device smoke

## Milestone: R-Audit-2026-08-14 (2026-08-14)

- CODE_REVIEW: hide-content catch, session permission allowlist, Electron 41.10.3, `fast-uri@3.1.5`, js-yaml 4.3.0 not in CVE range
- Node feature-gate now runs `electron` `test:unit` (24 tests); gate scripts skip Windows Store `python3`
- HUMAN residual: `/push` 0.17.0 alignment + branding; signed rebuild after Electron patch lands on `master`

## Milestone: bootstrap parity 0.17.0 (2026-08-14)

- Agent surface: resolved Critique, `/codex-review` (local opt-in), expanded `/prerelease`, branding kit mapped to GMFD
- Pin `.template-version` / release-please manifest / TEMPLATE_INDEX → **0.17.0**
- Product README unchanged; Codex CI workflow remains example-only

## Milestone: /ship v1.8.0 (2026-07-30)

- Windows OS toasts + tray unread red-dot; session notification allowlist; tray rollout for existing Win installs
- Tagged **v1.8.0**; unsigned desktop artifacts via `release-desktop.yml` on tag
- Template pin remains **0.15.1**; HUMAN residual: sign/notarize + toast/tray device smoke

## Milestone: /ship v1.7.1 (2026-07-30)

- Sign-in guidance auto-complete; NativeImage/preload hardenings; `verify-win-unpacked` on `package:win`
- Tagged **v1.7.1**; unsigned desktop artifacts via `release-desktop.yml` on tag
- Template pin remains **0.15.1**; HUMAN residual: sign/notarize + device smoke

## Milestone: /ship v1.7.0 (2026-07-29)

- Tagged **v1.7.0**; GitHub Release notes published; required CI / Security Scan / CodeQL green on `0453f87`+ packaging fix
- Electron first-run + mac/linux CI (`release-desktop.yml`); package scripts webpack before builder
- HUMAN residual: signed binaries, device smoke first-run, close app before local `package:win` (EBUSY)

## Milestone: R-Audit-2026-07-29c (2026-07-29)

- CODE_REVIEW.md: F-001–F-007 AGENT fixed (openExternal allowlist, SFTA opt-in, sample URL harden, CI unsigned + permissions, TEMPLATE_INDEX)
- CodeQL host-parse fix for Messages URL checks
- Gates: validate-bootstrap --quick, watch-agent-gates, hygiene, README health **pass**
- Dependabot open alerts: **0**; CodeQL had 1 open (incomplete URL sanitization) — fixed locally, needs push/re-scan
- HUMAN residual: signed binaries, device smoke, confirm CodeQL clears on master

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
