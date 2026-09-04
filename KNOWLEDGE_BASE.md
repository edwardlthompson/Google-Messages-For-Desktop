# Knowledge Base — Google Messages for Desktop

## KB-001 — Product shape

**Shipping:** Electron app under `electron/` (Windows / macOS / Linux) — OrangeDrangon-derived shell; `sms:`/`tel:`/`im:` compose.
**Legacy:** Chromium App Host (`host/windows`) and Nativefier scripts — rollback only.

**Fork provenance:** GitHub repo is `edwardlthompson/Google-Messages-For-Desktop`. Upstream product origin remains `kelyvin/Google-Messages-For-Desktop`.

## KB-013 — Template pin 0.17.0 (2026-08-14)

Agent/process surface matches `agent-project-bootstrap` **v0.17.0**. Product semver is **1.8.1**. Codex review is local/opt-in; do not enable the example workflow as live CI. Branding kit is metadata + preview only — never overwrite product `README.md`.

## KB-002 — Yarn lockfile + npm scripts

Root `yarn.lock` may be empty. Electron uses `electron/package-lock.json`. Do not re-add locked `nativefier` at root — it floods Trivy/Dependabot with Electron packaging CVEs. Electron `package:*` must webpack into `app/` before electron-builder (CI failure if package-only).

## KB-003 — Default branch is master

All GitHub Actions must trigger on `master`. Do not rename to `main` without HUMAN approval.

## KB-004 — No examples vendor

Template Golden Paths under `examples/**` are intentionally absent. Node module docs describe **root** / `electron/` packaging, not Hono.

## KB-005 — Maintenance posture

Prefer Electron packaging and protocol/onboarding work over rewriting the Messages SPA UI.

## KB-014 — R-Audit-2026-08-14 (2026-08-14)

- Session perms: allowlist only (`notifications`, clipboard, fullscreen, `media`/`mediaKeySystem`) for `messages.google.com`
- Outer Notification catch must send empty title/body (main re-sanitizes); never raw `options.body`
- Electron pin **41.10.3**; `overrides.fast-uri: 3.1.5`; js-yaml 4.3.0 is outside CVE-2026-59870
- `feature-gate.sh --stack node` runs `npm --prefix electron run test:unit`
- Git Bash: skip WindowsApps `python3` via `scripts/lib/pick-python.sh` or gates hang

## KB-010 — Electron brace-expansion override (2026-07-29)

Trivy HIGH on transitive `brace-expansion`. Pin `electron/package.json` `overrides.brace-expansion: 5.0.9` (CVE-2026-14257 + GHSA-rgw5-rvv9-x895 bypass of 5.0.8). Remove override when unused.

## KB-012 — /ship v1.7.1 regressions (2026-07-30)

- Incomplete `electron/dist/win-unpacked` (missing `icudtl.dat` / paks / locales) → ICU FD error and instant exit; always run `verify-win-unpacked` after package.
- Stage B sign-in guidance must auto-complete when `/conversations` is live or it reopens every launch and burns a BrowserWindow + 2.5s poll timer.
- Product tag is manual; template pin stays **0.15.1**.

## KB-011 — /ship v1.7.0 regressions (2026-07-29)

- Trivy fails on Electron lockfile HIGH unless `brace-expansion` overridden to 5.0.8.
- `release-desktop` must webpack before package; CI Node 20 cannot load `webpack.config.ts` without a register — use `webpack.config.mjs`.
- Local `package:win` can EBUSY if `electron/dist/win-unpacked` is locked by a running app.
- Product tag `v1.7.0` is manual; template pin stays **0.15.1**. Unsigned CI artifacts attach to the GitHub Release; SBOM/Pages N/A for this stack.

## KB-009 — /ship v1.5.0 regressions (2026-07-29)

- Pre-release `feature-gate --stack multi` fails without `examples/web` — use stack from `.cursor/stack-selection.json` (`node`).
- Scorecard deferred (H6): no `scorecard.yml`; security triage must skip when absent.
- WSL: `gh` lives under `/mnt/c/Program Files/GitHub CLI/gh.exe` (spaces) — use `scripts/lib/resolve_gh.sh`.
- GitHub Release `v1.5.0` was notes-only (no binaries); deleted 2026-09-02. Git tag `v1.5.0` kept. Current Windows/mac/linux assets ship on `v1.9.0`.
- Pages demo N/A (not a web stack).

## KB-006 — Windows notifications quirk

Historical Electron/Windows issue: `app.setAppUserModelId(process.execPath)` inside generated Nativefier `resources/app/lib/main.js`. Current Electron shell sets AUMID to `com.edwardlthompson.google-messages` (matches `appId`).

**Current behavior (Electron under `electron/`):**

- Session `persist:main` grants `"notifications"` only for `messages.google.com`.
- On Windows, page `Notification` is routed via IPC to a main-process Electron `Notification` (4s dedupe; skip when main window focused; honors Hide Notification Content).
- Unread tray red-dot requires tray enabled (`trayEnabled` defaults **true** on Windows for new settings; one-time `windowsTrayRolloutV1` also enables tray + color icon for older installs). Observers re-bind if the conversation list SPA remounts.
- Unsigned Windows builds omit Tray GUID (GUID + path changes can prevent icon creation until the app is code-signed).
- Look for the icon in the notification area near the clock (and the overflow chevron), not as a taskbar app button. Toggle: app **Settings → Enable Tray Icon** (not Windows Settings → Default apps).
- Unread false→true also sends a generic OS toast (no DOM snippets) through the same dedupe path.
- Installed NSIS builds with a Start Menu shortcut remain the most reliable Action Center target; `npm run dev` / portable may still be flaky for toasts.

### Regress — /ship v1.10.2 (2026-09-04)

- Product tag **v1.10.2** @ `96b4bac`. CI / Security Scan / CodeQL green. Release desktop **PASS**; **11** unsigned Win/mac/linux assets
- Local `pre-release-gate --local` PASS. Hard GitHub gate FAIL (expected, KB-009): no Scorecard; protection check queries `main`
- `wait-release-sbom` FAIL (looked at latest `v1.10.1`; no CycloneDX/OpenVEX on desktop workflow — expected). Pages N/A (`check-pages-analytics` PASS). Dependabot Critical/High = 0
- `simulate-template-upgrade` FAIL after clone `init-project.sh --stack web` (`check-readme-badges.sh` template badges). Same leftover as v1.10.1
- No live Release Please — product tags stay manual. Template RP dry-run would open **1.1.0** (do not merge)
- Applied ruff-pre-commit v0.16.6; did not apply upd’s `github/codeql-action` `vcodeql-bundle-*` rewrite
- Splash chrome ready ~0.5–1s then `loadURL`; `hasMw` still tens of seconds (Google SPA)

### Regress — /ship v1.10.1 (2026-09-02)

- Product tag **v1.10.1** @ `083c43c`. CI / Security Scan / CodeQL green. Release desktop **PASS**; **11** unsigned Win/mac/linux assets
- Local `pre-release-gate --local` PASS. Hard GitHub gate FAIL (expected, KB-009): no Scorecard; protection check queries `main`
- `wait-release-sbom` FAIL (no CycloneDX/OpenVEX — expected). Pages N/A (`check-pages-analytics` PASS). Dependabot Critical/High = 0
- `simulate-template-upgrade` FAIL after clone `init-project.sh --stack web` (`check-readme-badges.sh` template badges). Same leftover as v1.10.0
- No live Release Please — product tags stay manual. Template RP dry-run would open **1.1.0** (do not merge)
- Did not apply upd’s `github/codeql-action` `vcodeql-bundle-*` rewrite
- Cold start: first visible window ~0.6s after splash + deferred protocol `reg.exe` (was ~14.5s blank)

### Regress — /ship v1.10.0 (2026-09-02)

- Product tag **v1.10.0** @ `799ff61` (first tag @ `e81c3cc` failed mac: empty `CSC_LINK` treated as a cert path / `electron not a file`; retagged after `identity: null`)
- CI / Security Scan / CodeQL green after `BOOTSTRAP_OPTIONAL_LINT=skip` (no actionlint/zizmor/hadolint in this child’s Actions image) and gitleaks allowlist for privacy-report sanitizer fixtures
- `feature-gate` multi PASS; local `pre-release-gate --local` PASS; About-slice skipped when `examples/web` is absent
- Hard `pre-release-gate.sh` FAIL (expected, KB-009): no Scorecard workflow; `verify-branch-protection.sh` queries `main` while default branch is `master`
- Release desktop **PASS**; **11** unsigned Win/mac/linux assets. `wait-release-sbom` FAIL (no CycloneDX/OpenVEX on this workflow — expected)
- Pages N/A (`check-pages-analytics` PASS). Dependabot open Critical/High = 0
- `simulate-template-upgrade` FAIL after clone `init-project.sh --stack web`: `check-readme-badges.sh` wants template hero/owner badges. First clone `--quick` passed on the product README
- No live Release Please workflow — product tags stay manual. Template RP dry-run still thinks 0.17.0→0.18.0 from remote history
- Release Actions annotate Node.js 20 deprecation (non-blocking)

### Regress — /ship v1.9.0 (2026-08-22)

- Child gates: `feature-gate --stack node` PASS; license PASS; Dependabot Critical/High = 0
- Hard `pre-release-gate.sh` FAIL (expected): About slice needs `examples/web`; no Scorecard workflow; classic protection 404 on `master` (KB-009)
- First `v1.9.0` tag failed `release-desktop` webpack (`Can't resolve './helpers/bindDisplayRefresh'`). Include every file `background.ts` imports before tagging.
- Retagged **v1.9.0** @ `73290d1`; Release desktop **PASS**; **11** unsigned desktop assets (no SBOM — expected); Pages N/A
- No live Release Please workflow — product tags stay manual

### Regress — /ship v1.8.1 (2026-08-14)

- Pre-release gate **PASS** on `6adf8c6`; CI / Security Scan / CodeQL green
- First Security Scan on `4efa7ff` failed Trivy HIGH `brace-expansion@5.0.8` (GHSA-rgw5-rvv9-x895); pin **5.0.9** and retag
- GitHub Release **v1.8.1** has **11** unsigned desktop assets (no SBOM — expected); Pages N/A
- Close `electron/dist/win-unpacked/GoogleMessages.exe` before `package:win` or electron-builder hits EBUSY

### Regress — /ship v1.8.0 (2026-07-30)

- Pre-release gate + upgrade simulation **PASS**; CI / Security Scan / CodeQL green on `f298bf5`
- GitHub Release **v1.8.0** has **11** unsigned desktop assets (no SBOM attach — expected); Pages N/A
- `release-desktop.yml` annotates Node.js 20 action deprecation (non-blocking; optional future bump to Node 24 actions)

## KB-007 — Local compute only

Do not use Cursor Cloud Agents for this repository. Prefer local parallel Task/worktrees; `BOOTSTRAP_CHECK_JOBS=2` tip on Windows.

## KB-008 — validate-bootstrap vs product CI

`scripts/validate-bootstrap.sh` gates agent/template hygiene. It does **not** build Nativefier desktop binaries — by design (H5).
