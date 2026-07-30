# Knowledge Base — Google Messages for Desktop

## KB-001 — Product shape

**Shipping:** Electron app under `electron/` (Windows / macOS / Linux) — OrangeDrangon-derived shell; `sms:`/`tel:`/`im:` compose.  
**Legacy:** Chromium App Host (`host/windows`) and Nativefier scripts — rollback only.

**Fork provenance:** GitHub repo is `edwardlthompson/Google-Messages-For-Desktop`. Upstream product origin remains `kelyvin/Google-Messages-For-Desktop`.

## KB-002 — Yarn lockfile + npm scripts

Root `yarn.lock` may be empty. Electron uses `electron/package-lock.json`. Do not re-add locked `nativefier` at root — it floods Trivy/Dependabot with Electron packaging CVEs. Electron `package:*` must webpack into `app/` before electron-builder (CI failure if package-only).

## KB-003 — Default branch is master

All GitHub Actions must trigger on `master`. Do not rename to `main` without HUMAN approval.

## KB-004 — No examples vendor

Template Golden Paths under `examples/**` are intentionally absent. Node module docs describe **root** / `electron/` packaging, not Hono.

## KB-005 — Maintenance posture

Prefer Electron packaging and protocol/onboarding work over rewriting the Messages SPA UI.

## KB-010 — Electron brace-expansion override (2026-07-29)

Trivy HIGH CVE-2026-14257 on transitive `brace-expansion@2.1.3` via Electron lockfile. Pin with `electron/package.json` `overrides.brace-expansion: 5.0.8` until parents ship a fixed range. Remove override when unused.

## KB-011 — /ship v1.7.0 regressions (2026-07-29)

- Trivy fails on Electron lockfile HIGH unless `brace-expansion` overridden to 5.0.8.
- `release-desktop` must webpack before package; CI Node 20 cannot load `webpack.config.ts` without a register — use `webpack.config.mjs`.
- Local `package:win` can EBUSY if `electron/dist/win-unpacked` is locked by a running app.
- Product tag `v1.7.0` is manual; template pin stays **0.15.1**. Unsigned CI artifacts attach to the GitHub Release; SBOM/Pages N/A for this stack.

## KB-009 — /ship v1.5.0 regressions (2026-07-29)

- Pre-release `feature-gate --stack multi` fails without `examples/web` — use stack from `.cursor/stack-selection.json` (`node`).
- Scorecard deferred (H6): no `scorecard.yml`; security triage must skip when absent.
- WSL: `gh` lives under `/mnt/c/Program Files/GitHub CLI/gh.exe` (spaces) — use `scripts/lib/resolve_gh.sh`.
- GitHub Release `v1.5.0` notes published; **binary assets** (Setup EXE / zip) still need HUMAN `npm run release:windows` upload.
- Pages demo N/A (not a web stack).

## KB-006 — Windows notifications quirk

Historical Electron/Windows issue: `app.setAppUserModelId(process.execPath)` inside generated Nativefier `resources/app/lib/main.js`. See product `README.md`.

## KB-007 — Local compute only

Do not use Cursor Cloud Agents for this repository. Prefer local parallel Task/worktrees; `BOOTSTRAP_CHECK_JOBS=2` tip on Windows.

## KB-008 — validate-bootstrap vs product CI

`scripts/validate-bootstrap.sh` gates agent/template hygiene. It does **not** build Nativefier desktop binaries — by design (H5).
