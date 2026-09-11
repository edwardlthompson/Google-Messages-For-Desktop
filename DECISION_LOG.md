# Decision Log

## 2026-09-11 — /ship v1.11.1

- **Status:** Accepted
- **Context:** `/ship` after template 1.4.0 catch-up, Waiting HUMAN leftover automation, board cleanup, and About-gate skip for missing `examples/web`.
- **Decisions:**
  - Product **1.11.1**. Manual tag after CI (do not merge template Release Please 1.1.0).
  - Keep `github/codeql-action@v3` / `@v4` pins (upd false-positive `vcodeql-bundle-*` skipped).
  - Scorecard workflow is informational; required checks stay CI / Security Scan / CodeQL on `master`.
  - F-009 signing stays deferred; launch update checks stay off.
- **Consequences:** GitHub Release **v1.11.1** will have unsigned Win/mac/linux artifacts. Scorecard Action starts after this push.

## 2026-09-11 — Automate Waiting-on-a-person HUMAN rows

- **Status:** Accepted
- **Context:** Five HUMAN leftovers on the slim board: F-009 signing wire-up, Sacred `examples/{node,python,web}`, OpenSSF Scorecard + `master` protection names.
- **Decisions:**
  - F-009: keep `CSC_LINK` wiring in `release-desktop.yml`; `checkForUpdateOnLaunchEnabled` stays **false** until secrets exist. Do not invent signing certs.
  - Sacred 18–20: never vendor parent `examples/`; node product is `electron/`.
  - Enable `.github/workflows/scorecard.yml` (weekly + push to `master`, informational). README Scorecard badge on. Merge-blocking checks stay **CI / Security Scan / CodeQL** on `master` (not parent template job names).
  - Scripts: `scripts/gmfd-human-waiting.sh` (includes GitHub protection apply) and `scripts/check-gmfd-waiting.sh` (local gate in validate-bootstrap).
- **Consequences:** BUILD_PLAN Waiting rows ✅. `HUMAN_BACKLOG.md` cleared. Scorecard GitHub Action appears after `scorecard.yml` is pushed. Unsigned installers remain until `CSC_LINK` / Apple secrets.

## 2026-09-11 — Template 1.4.0 catch-up (named `/upgrade` 1–20)

- **Status:** Accepted
- **Context:** Parent `agent-project-bootstrap` **v1.4.0** (Monday template-gap BUILD_PLAN sync). Child was at template **1.3.0**. Product stays **1.11.0**. User named items **1–20**.
- **Decisions:**
  - Copy Canon 1–7 (`upgrade.md`, `docs/help/UPGRADE.md`, `repo_mode.py`, gap-sync scripts, `template_gap.py`).
  - Merge Mixed 8–16: feature spec, tests, `BUILD_PLAN`/`BUILD_PLAN_TEMPLATE` markers, `UPGRADING_FROM_TEMPLATE.md`, `TEMPLATE_INDEX.json` paths, hand-pin 1.4.0, pre-commit (already matched), `weekly-health-check.yml`.
  - Item 17: do not overwrite product CHANGELOG, AGENT_MEMORY, README body, or parent DECISION_LOG/COMPLETED_TASKS.
  - Items 18–20: Sacred `[HUMAN]` only — did not copy `examples/`.
  - Pin 1.4.0 by hand (not `sync-template-version.sh`). README **Version: 1.11.0**; template badge only.
  - Weekly-health: `master` default branch push pattern; Scorecard triage non-strict; SBOM wait `continue-on-error` (Electron installers, not template Golden Path SBOMs).
- **Consequences:** `validate-bootstrap --quick` and `feature-gate --stack node` pass. Monday cron may commit BUILD_PLAN syncs. Scorecard/`main` protection remain HUMAN_BACKLOG. F-009 signing remains the ship residual.

## 2026-09-11 — Template 1.3.0 catch-up (Canon + safe Mixed)

- **Status:** Accepted
- **Context:** Child was pinned at template **1.0.0**. Parent `agent-project-bootstrap` is **1.3.0**. Named set: all Canon copies plus safe Mixed merges. Sacred files and `examples/` stayed untouched. Product semver stays **1.11.0**.
- **Decisions:**
  - Copy Canon from a full `v1.3.0` tree without `--delete`; restore Electron `test:unit`, GMFD helpers, and `scripts/desktop/` + `scripts/windows/`.
  - Pin 1.3.0 by hand (do not run `sync-template-version.sh` or Release Please). README **Version: 1.11.0**; template badge only.
  - Fork `ci_gaps.py` for `branches: [master]` and skip nix/`ci-ok` when `ci-ok` is absent. Keep `BOOTSTRAP_OPTIONAL_LINT: skip`. Inactive-stack Golden Path unittests skip on this child.
  - Do not add parent `release.yml`, `pages.yml`, or `scorecard.yml`. Product release remains `release-desktop.yml`.
  - OpenSSF Scorecard + `master` vs `main` branch-protection names stay on `HUMAN_BACKLOG.md`. F-009 signing remains the ship residual.
- **Consequences:** `validate-bootstrap --quick` and `feature-gate --stack node` pass locally. `/ship` regress still treats Scorecard/`main` protection as expected FAIL.

## 2026-09-10 — /ship v1.11.0

- **Status:** Accepted
- **Context:** `/ship` after nested Settings, Pixel-style notification chime, color tray default, and Linux autostart that writes XDG immediately.
- **Decisions:**
  - Product **1.11.0**. Manual tag after CI (do not merge template Release Please 1.1.0).
  - Keep `github/codeql-action@v3` (upd false-positive bundle tag skipped).
  - Original bundled chime (not Google's proprietary Pixel Onward samples).
  - F-009 signing stays deferred.
- **Consequences:** GitHub Release **v1.11.0** will have unsigned Win/mac/linux artifacts.

## 2026-09-07 — /ship v1.10.3

- **Status:** Accepted
- **Context:** `/ship` after Linux pairing loop (emoji confirm dropped to login) was fixed and verified on this device. Windows Electron shares the same main process; Chrome `--app` host flags aligned.
- **Decisions:**
  - Product **1.10.3**. Manual tag after CI (do not merge template Release Please 1.1.0).
  - Keep `github/codeql-action@v3` (upd false-positive bundle tag skipped).
  - F-009 signing stays deferred.
- **Consequences:** GitHub Release **v1.10.3** will have unsigned Win/mac/linux artifacts. Pairing fix is in Electron for all three OS packages.

## 2026-09-07 — Pairing token loop on Linux Electron

- **Status:** Accepted
- **Context:** After Google sign-in, phone emoji/desktop-icon confirm bounced the Linux app back to welcome/login. Account SID/OSID cookies were present; pairing never stuck. Welcome reloaded ~every 15s. Windows Chrome `--app` already passes `DeviceBoundSessions` kills.
- **Decisions:**
  - Electron `disable-features=DeviceBoundSessions,DeviceBoundSessionCredentials,ThirdPartyCookiePhaseout,TrackingProtection3pcd` (not UA spoofing).
  - Boot `loadURL` uses `/web/` (`messagesBootUrl`) instead of `/conversations`.
  - Auth popups keep `persist:main` but are not parented/modal (avoid cross-site cookie ancestor).
  - Allow `storage-access` from Messages and accounts.google.com.
- **Consequences:** Local `.deb` must be rebuilt for the installed app. HUMAN retries QR/emoji after restart; unpair old desktop sessions on the phone first.

## 2026-09-07 — Local Linux .deb build + install smoke

- **Status:** Accepted
- **Context:** Create a Linux package on this device, automate `.deb` install, and smoke process + desktop metadata (no Google login).
- **Decisions:**
  - Use nvm Node **22** locally (Electron 41 engines); do not use Ubuntu apt Node 12.
  - Add `electron/scripts/verify-linux-unpacked.mjs` (mirror of win-unpacked) and `scripts/desktop/install-and-smoke-linux-deb.sh` (+ root `linux:install-smoke`).
  - Smoke = `apt` install + binary + `.desktop` MimeType/`StartupWMClass` + brief launch under `$DISPLAY`; leave package installed for HUMAN sign-in.
  - F-009 signing stays deferred.
- **Consequences:** Local `Google.Messages-v1.10.2-linux-amd64.deb` build path documented in `docs/WAYLAND.md`. Interactive QR pairing remains `[HUMAN]`.

## 2026-09-07 — Pairing token loop on Linux Electron

## 2026-09-04 — /ship v1.10.2

- **Status:** Accepted
- **Context:** `/ship` after splash-first / gray-splash work on local 1.10.2 installs.
- **Decisions:**
  - Product **1.10.2**. Manual tag after CI (no live Release Please workflow; do not merge template RP 1.1.0).
  - Splash `loadFile` + stage bar before creating the main window; parent/raise splash over the inactive Messages shell.
  - Do not rewrite `github/codeql-action@v3`. Applied ruff-pre-commit v0.16.6 only.
  - README stays on `readme-hero.svg` (neon PNG is 1.9MB, over the 500KB tracked-file gate).
  - F-009 signing stays deferred.
- **Consequences:** GitHub Release **v1.10.2** has 11 unsigned desktop assets. Hard GitHub `pre-release-gate` still fails Scorecard + `main` protection 404 (KB-009).

## 2026-09-02 — /ship v1.10.1

- **Status:** Accepted
- **Context:** `/ship` after splash/startup work on installed 1.10.0 (14.5s to first HWND).
- **Decisions:**
  - Product **1.10.1**. Manual tag after CI (no live Release Please workflow; do not merge template RP 1.1.0).
  - Show a local splash immediately; defer `registerWindowsProtocolHandlers` off the first-paint path.
  - Do not rewrite `github/codeql-action@v3`.
  - F-009 signing stays deferred.
- **Consequences:** GitHub Release **v1.10.1** has 11 unsigned desktop assets. Hard GitHub `pre-release-gate` still fails Scorecard + `main` protection 404 (KB-009).

## 2026-09-02 — /ship v1.10.0

- **Status:** Accepted
- **Context:** `/ship` after Sprint G + HUMAN_BACKLOG clear.
- **Decisions:**
  - Product **1.10.0**. Manual tag after CI (no live Release Please workflow).
  - Skip template About-slice gate when `examples/web` is absent.
  - Pin `fast-uri` 3.1.6 and `@xmldom/xmldom` 0.8.15. Do not rewrite `github/codeql-action@v3`.
  - When `CSC_LINK` is empty, electron-builder mac `identity: null` (unsigned CI). Retag `v1.10.0` onto that fix.
  - F-009 signing stays deferred.
- **Consequences:** CHANGELOG `[1.10.0]` folded; `[Unreleased]` empty. Local `pre-release-gate --local` passed. GitHub Release **v1.10.0** has 11 unsigned desktop assets. Hard GitHub `pre-release-gate` still fails Scorecard + `main` protection 404 (KB-009).

## 2026-09-02 — HUMAN_BACKLOG cleared

- **Status:** Accepted
- **Context:** Device smokes after 1.9.0 NSIS install: installer, `sms:`/`tel:` pairing, taskbar pin identity.
- **Decisions:** Archived the ten rows into `COMPLETED_TASKS.md` and reset `HUMAN_BACKLOG.md` to the empty table. Empty GitHub Release `v1.5.0` stays deleted; shipping assets remain on `v1.9.0`.
- **Consequences:** No open `[HUMAN]` 🔲 items. F-009 auto-update signing is still deferred (not on this list).

## 2026-09-02 — Skip v1.5.0 binary upload

- **Status:** Accepted
- **Context:** HUMAN_BACKLOG item 4 asked to attach host Setup EXE + zip to GitHub Release `v1.5.0`. That release had zero assets; Latest `v1.9.0` already has Electron Windows/mac/linux binaries.
- **Decisions:** Deleted the GitHub Release `v1.5.0` (`gh release delete v1.5.0 --yes`). Did **not** delete git tag `v1.5.0`. Do not rebuild or upload Chromium App Host 1.5.0 installers.
- **Consequences:** CHANGELOG `[1.5.0]` remains historical. Downloads go to [v1.9.0](https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases/tag/v1.9.0).

## 2026-09-02 — /build Sprint G AGENT complete

- **Status:** Accepted
- **Context:** Autonomous `/build` finished the desktop product backlog sequential `[AGENT]` rows.
- **Decisions:**
  - Keep `persist:main` as the default partition; Work/Personal use `persist:profile-*`; Guest is in-memory and wiped on quit. Auth modals stay on the active partition.
  - Never ignore TLS (`certificate-error` always denies). Density CSS is local files only. No UA spoof.
  - Protocol compose confirm + optional signature; canned snippets from clipboard. Jump List recent numbers come from protocol compose, not Google's DOM.
  - Managed `managed-policy.json` can force updates off / tray / autostart. MSI/AppLocker/notarization remain docs + `[HUMAN]` signing.
- **Consequences:** 147 Electron `test:unit` tests; webpack `build:dev` green. Device installer/protocol smokes later cleared on `HUMAN_BACKLOG.md`. F-009 auto-update publish remains deferred.

## 2026-09-02 — Automate BUILD_PLAN HUMAN rows

- **Status:** Accepted
- **Context:** User asked to automate every `[HUMAN]` item on BUILD_PLAN.
- **Decisions:**
  - Child handlers in `scripts/lib/human_task_gmfd.py` + `human_task_gmfd_github.py` (wired into `/build` `attempt-build-plan-row`).
  - `release-desktop.yml` signs when `CSC_LINK` / Apple secrets exist; stays unsigned otherwise.
  - Device/toast/update smokes use `electron` `test:unit` (npm.cmd on Windows). Interactive Google pairing is still a live-device check, not a gate.
  - GitHub Issues + Discussions enabled; FUNDING.yml + About/topics applied via `gh`.
  - `engines.node` is `>=20.0.0`. Never run `init-project` on this child.
- **Consequences:** No open `[HUMAN]` 🔲 rows on BUILD_PLAN. Production Authenticode/Apple identity still needs repo secrets. Screenshot PNGs are icon stand-ins until Playwright.

## 2026-08-22 — /ship v1.9.0

- **Status:** Accepted
- **Context:** Reuse Continuum Calendar donate + update method on this Electron app.
- **Decisions:**
  - Product **1.9.0**. Manual tag; no Release Please workflow on this child.
  - Compare GitHub installer filenames, not git/template tags. Donate never shares the update dialog.
  - Prefs stay in device-local `product-update.json`.
  - Retag `v1.9.0` onto `73290d1` after the first tag failed webpack (`bindDisplayRefresh` was untracked).
- **Consequences:** Unsigned CI artifacts on GitHub Release. HUMAN: sign/notarize + smoke donate note / Install-Later. Hard pre-release-gate remains template-maintainer-shaped (KB-009).

## 2026-08-14 — /ship v1.8.1

- **Status:** Accepted
- **Context:** Audit + template 0.17.0 + Dependabot High needed a product patch.
- **Decisions:**
  - Product **1.8.1** (template pin stays **0.17.0**). Manual tag; no Release Please PR.
  - Electron **41.10.3**, `fast-uri@3.1.5`, `js-yaml@4.3.1`, then `brace-expansion@5.0.9` after Trivy failed on 5.0.8.
  - Retag `v1.8.1` onto `6adf8c6` in the same ship (tag was minutes old).
- **Consequences:** Unsigned CI artifacts on GitHub Release. HUMAN: sign/notarize + device smoke. Close win-unpacked app before local `package:win`.

## 2026-08-14 — R-Audit Dependabot High 71–74

- **Status:** Accepted
- **Context:** Open Dependabot High on `electron/package-lock.json` after `/audit`.
- **Decisions:**
  - Bump Electron **41.10.1 → 41.10.3** (GHSA-9f4c-93c8-jc8g / CVE-2026-70608). Patch line; app already uses `setWindowOpenHandler` for Google auth hosts. HUMAN: signed rebuild after `/push`.
  - Override transitive `fast-uri` **3.1.4 → 3.1.5** (CVE-2026-18446). Dev-only via electron-builder/ajv; still pin.
  - Override transitive `js-yaml` **4.3.0 → 4.3.1** (GHSA-5p4m-2wfm-xmqj, 4.x !!omap). Do not jump to 5.x.
- **Consequences:** Lockfile refresh in `electron/`. Alerts 71–74 should close after `/ship` push + Dependabot re-scan.

## 2026-08-14 — Bootstrap template parity 0.15.1 → 0.17.0

- **Status:** Accepted
- **Context:** `check-template-updates` reported upstream **v0.17.0** while this child was pinned at 0.15.1.
- **Decisions:**
  - Adopt 0.16 agent contract (resolved Critique, `/codex-review`, expanded `/prerelease` + supporting scripts)
  - Codex stays local FOSS optional; `.github/workflow-examples/codex-review.yml` is not a live workflow
  - Add product-mapped `branding/` so validate-bootstrap REQUIRED paths pass; do not overwrite product `README.md`
  - Keep `master`, Electron/`node`, no `examples/`, no Cloud Agents
- **Consequences:** Template pin **0.17.0** (not product semver). HUMAN: optional Codex CLI smoke; manual `INITIALIZATION_PROMPT.md` merge.

## 2026-07-30 — Windows OS notifications + tray unread badge

- **Status:** Accepted
- **Context:** Users need Windows toasts and a tray unread red-dot for new Messages; tray was off by default and unsigned Tray GUIDs could fail when the exe path changed.
- **Decisions:**
  - Grant `notifications` on `persist:main` only for `messages.google.com`
  - Windows: route page `Notification` via IPC to main-process Electron toasts (focus skip, 4s dedupe, hide-content)
  - Remount-safe unread observers; unread false→true generic toast fallback (no DOM snippets)
  - One-time `windowsTrayRolloutV1` enables tray + color icon; omit Tray GUID until code-signed
- **Consequences:** Product **v1.8.0**; look for icon in notification area (not taskbar pin); HUMAN smoke for toast/red-dot.

## 2026-07-30 — Sign-in guidance auto-complete + package verify

- **Status:** Accepted
- **Context:** `/ship` follow-up after Electron log scan: Stage B window stayed open after pairing (`signInGuidanceCompleted` false); incomplete `win-unpacked` lacked ICU/pak files and crashed on relaunch.
- **Decisions:**
  - Probe/auto-dismiss Stage B when conversation list detected; persist `signInGuidanceCompleted`
  - Harden tray/notification/window NativeImage inputs; preload path = `__dirname/bridge.js`
  - Gate `package:win` with `electron/scripts/verify-win-unpacked.mjs`
- **Consequences:** Product **v1.7.1**; fewer stuck guidance windows; packaging fails closed if Chromium runtime files missing.

## 2026-07-29 — Electron package scripts must webpack first

- **Status:** Accepted
- **Context:** `release-desktop.yml` failed on all OS: `app/background.js` missing from asar (webpack output is gitignored).
- **Decisions:** `package` / `package:win|mac|linux` run `npm run build` then electron-builder with `--publish never`.
- **Consequences:** CI unsigned smoke can attach artifacts; local packaging needs `electron/dist` unlocked (close running app).

## 2026-07-29 — Electron brace-expansion override (CVE-2026-14257)

- **Status:** Accepted
- **Context:** `/ship` Security Scan (Trivy) failed on `electron/package-lock.json` HIGH `brace-expansion@2.1.3` (transitive via `fs-jetpack` / builder tooling).
- **Decisions:** Add `overrides.brace-expansion: 5.0.8` in `electron/package.json`; refresh lockfile; retag `v1.7.0` to the fixed commit in the same ship session (release CI had not gone green).
- **Consequences:** Trivy production FS scan should clear; remove override when upstream parents depend on a fixed line without forcing major jump.

## 2026-07-29 — First-run stages + mac/linux Electron + Venmo

- **Status:** Accepted
- **Context:** Signed-out users need defaults onboarding without compose; prepare multi-platform Electron releases; add donation link.
- **Decisions:**
  - Stages: Defaults (association-only probes) → Sign-in guidance → optional Verify
  - Suppress compose for onboarding sample number / association-only mode
  - Ship mac/linux via same `electron/` + electron-builder + `release-desktop.yml` Actions matrix; Nativefier legacy-only
  - Venmo: `https://venmo.com/code?user_id=1857304970395648420` in README / Help / About
- **Consequences:** Product version **1.7.0**; mac/linux binaries produced on CI or native OS hosts.

## 2026-07-29 — Windows UI: Electron from OrangeDrangon + protocols

- **Status:** Accepted
- **Context:** User confirmed OrangeDrangon Electron app signs in successfully; requested a Chrome-free UI (option B) while keeping sms/tel compose as differentiator.
- **Decisions:**
  - Port OrangeDrangon shell into `electron/` (MIT NOTICE); Electron 41; shared `persist:main` + in-app Google auth modals; no UA spoof
  - Add `sms`/`tel`/`smsto`/`callto` registration + page compose via `executeJavaScript`
  - `npm run windows` / `release:windows` → electron-builder; Chromium App Host kept as legacy rollback only
  - README credits OrangeDrangon and states protocol-handler difference
- **Consequences:** Shipping Windows path no longer requires Chrome/Edge `--app`; login smoke verified Electron window title `Google Messages` with auth handler present; full Google account sign-in still a HUMAN interactive check.

## 2026-07-29 — /ship v1.5.0 published

- **Status:** Accepted
- **Context:** User invoked `/ship` (prerelease → push → regress).
- **Decisions:** Merged alignment to `master`, tagged product **`v1.5.0`**, published GitHub Release notes; template `.template-version` remains **0.15.1** (bootstrap pin, not product semver).
- **Consequences:** HUMAN still uploads Windows Setup/zip assets; no Pages/SBOM workflow for this stack.

## 2026-07-29 — Unlock ship: drop locked Nativefier; adapt pre-release for node child

- **Status:** Accepted
- **Context:** `/ship` pre-release failed on About exemplar gate, Scorecard (deferred), Trivy/Dependabot Critical/High from Nativefier’s Electron tree.
- **Decisions:**
  - `pre-release-gate` uses stack from `.cursor/stack-selection.json` (`node`); skip About gate when `examples/web` absent; skip Scorecard when workflow absent (H6)
  - Remove root `nativefier` dependency; mac/linux scripts call `npx --yes nativefier@49.0.1` so CVEs are not locked in `yarn.lock`
  - Enabled GitHub vulnerability alerts via API during `/ship`
- **Consequences:** Windows App Host shipping path is no longer blocked by Nativefier packaging CVEs; mac/linux still rebuildable via npx.

## 2026-07-29 — /push v1.5.0 prepare (branch push; CI not fully green)

- **Status:** Accepted with residual HUMAN gates
- **Context:** User invoked `/push` after README update for Windows App Host.
- **Decisions:**
  - Pushed `chore(release): prepare v1.5.0 release` to `cursor/bootstrap-alignment-378a` (repo default branch is **`master`**, not `main`)
  - Local gates (bootstrap, feature-gate, hygiene, README, license) passed before push
  - Halt further release merge: Security Scan (Trivy Nativefier transitive HIGH/CRITICAL) and Dependency Review (graph disabled) failed; no Release Please PR open
- **Consequences:** PR #1 has CI hygiene green; HUMAN must enable Dependency graph / Dependabot and triage Trivy before treating release CI as green.

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
