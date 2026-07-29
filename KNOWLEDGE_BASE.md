# Knowledge Base — Google Messages for Desktop

## KB-001 — Product shape

**Windows (shipping):** Chromium App Host under `host/windows` — thin EXE + Chrome/Edge `--app` / `chrome_proxy` (Electron/WebView2 login rejected by Google).  
**mac/linux:** `npx --yes nativefier@49.0.1` via `package.json` scripts (not a locked root dependency).

**Fork provenance:** GitHub repo is `edwardlthompson/Google-Messages-For-Desktop`. Upstream product origin remains `kelyvin/Google-Messages-For-Desktop`. `package.json` `repository` / `bugs` / `homepage` point at this fork; keep Kelvin Nguyen as `author` for attribution.

## KB-002 — Yarn lockfile + npm scripts

`yarn.lock` is authoritative and may be empty (no production root deps as of v1.5.0). README and scripts use `npm run …`. Do not add `package-lock.json` without HUMAN approval. Do not re-add locked `nativefier` — it floods Trivy/Dependabot with Electron packaging CVEs.

## KB-003 — Default branch is master

All GitHub Actions must trigger on `master`. Do not rename to `main` without HUMAN approval.

## KB-004 — No examples vendor

Template Golden Paths under `examples/**` are intentionally absent. Node module docs describe **root** Nativefier packaging, not Hono.

## KB-005 — Maintenance mode

README states no new features. Do not rewrite the Messages UI as Electron/WebView2. Windows host hardening and packaging are in scope.

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
