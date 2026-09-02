# Completed Tasks

## HUMAN_BACKLOG — device + GitHub (2026-09-02)

- ✅ [HUMAN] Run `npm run build:installer` (Inno 7 detected) to produce Setup EXE; smoke-test install
- ✅ [HUMAN] Smoke-test: install or unpack tray build, pair phone, `start sms:+1…` / `start tel:+1…`, Chrome link click
- ✅ [HUMAN] Commit/push packaging + bootstrap alignment (merged PR #1)
- ✅ [HUMAN] Skipped — deleted empty GitHub Release `v1.5.0` (git tag kept; shipping binaries are on `v1.9.0`)
- ✅ [HUMAN] Dependabot alerts enabled (via `/ship` API); Critical/High cleared after empty yarn.lock
- ✅ [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
- ✅ [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
- ✅ [HUMAN] F-008 / R-Audit F-011 optional: bump `engines.node` to modern LTS after packaging smoke
- ✅ [HUMAN] Keep deferred workflows deferred unless explicitly requested (Scorecard, Release Please, Pages, stale, weekly-health, automerge PAT)
- ✅ [HUMAN] Re-pin Messages taskbar icon; confirm identity ≠ Google Chrome

## Sprint G — Desktop product backlog (2026-09-02)

- ✅ [AGENT] Sync README version and feature list to 1.9.0 (toasts, donate, Check for Updates) (`allideas #62`)
- ✅ [AGENT] README: portable Windows zip/exe is a supported download (`allideas #61`)
- ✅ [AGENT] README: what Check for Updates / Install actually does (`allideas #67`)
- ✅ [AGENT] Honor `sms:?body=` / `smsto:` prefill in protocol compose (`allideas #31`)
- ✅ [AGENT] Unit tests for `sms:?body=` parse (`allideas #71`)
- ✅ [AGENT] Expose Check for updates on launch in Settings (`checkForUpdateOnLaunchEnabled`) (`allideas #14`)
- ✅ [AGENT] Start with the operating system (autostart checkbox) (`allideas #13`)
- ✅ [AGENT] Native OS toasts on macOS and Linux (parity with Windows v1.8.0) (`allideas #1`)
- ✅ [AGENT] Unread count in the window title (`allideas #2`)
- ✅ [AGENT] Windows taskbar overlay unread badge (`allideas #3`)
- ✅ [AGENT] macOS Dock unread badge (`allideas #4`)
- ✅ [AGENT] Linux AppIndicator unread label (`allideas #5`)
- ✅ [AGENT] Click notification focuses the matching conversation when the web app allows it (`allideas #6`)
- ✅ [AGENT] Honor OS Focus Assist / DND (`allideas #7`)
- ✅ [AGENT] Quiet hours schedule in Settings (device-local) (`allideas #8`)
- ✅ [AGENT] Notification sound on/off using the OS default (`allideas #9`)
- ✅ [AGENT] Optional default Hide Notification Content (`allideas #10`)
- ✅ [AGENT] Tray tooltip unread count + last sender (honor Hide Content) (`allideas #11`)
- ✅ [AGENT] Mark all read from the tray (`allideas #12`)
- ✅ [AGENT] Always on top toggle (`allideas #15`)
- ✅ [AGENT] Persist zoom across restarts (`allideas #16`)
- ✅ [AGENT] Find in page (Ctrl+F) (`allideas #17`)
- ✅ [AGENT] Confirm Quit vs close-to-tray (remember choice) (`allideas #18`)
- ✅ [AGENT] Single-instance lock + protocol handoff into the existing window (`allideas #19`)
- ✅ [AGENT] Offline / unreachable banner with Reload (`allideas #20`)
- ✅ [AGENT] Opt-in local user CSS file (never remote) (`allideas #21`)
- ✅ [AGENT] Hardware acceleration toggle (restart required) (`allideas #22`)
- ✅ [AGENT] Reset window size and position (`allideas #23`)
- ✅ [AGENT] Export / import `settings.json` (`allideas #24`)
- ✅ [AGENT] Reset all settings (including stuck first-run flags) (`allideas #25`)
- ✅ [AGENT] Spell-check language picker (`allideas #26`)
- ✅ [AGENT] Keyboard shortcuts Help panel (`allideas #27`)
- ✅ [AGENT] Print conversation via system print (`allideas #28`)
- ✅ [AGENT] Attachment download location chooser (`allideas #29`)
- ✅ [AGENT] Help → Open downloads folder (`allideas #30`)
- ✅ [AGENT] Windows Share target (Share with Google Messages) (`allideas #32`)
- ✅ [AGENT] macOS Share / Services (`allideas #33`)
- ✅ [AGENT] Linux xdg-desktop-portal share (`allideas #34`)
- ✅ [AGENT] Drag-and-drop files onto the window to attach (`allideas #35`)
- ✅ [AGENT] Document paste-image-into-compose in Help (`allideas #36`)
- ✅ [AGENT] Register `mms:` scheme (`allideas #37`)
- ✅ [AGENT] Linux `.desktop` MimeType completeness for `sms:`/`tel:` (`allideas #38`)
- ✅ [AGENT] Protocol test links that include a message body (`allideas #39`)
- ✅ [AGENT] First-run skip pairing help when conversation list already exists (`allideas #40`)
- ✅ [AGENT] Sign out / clear Messages `persist:main` session from Settings (`allideas #41`)
- ✅ [AGENT] Disable DevTools in packaged builds (`allideas #43`)
- ✅ [AGENT] Review `openExternal` allowlist (Docs, Photos, Voice) (`allideas #44`)
- ✅ [AGENT] Explicit camera/mic permission only for Calls UI (`allideas #45`)
- ✅ [AGENT] Download confirmation for unexpected MIME types (`allideas #46`)
- ✅ [AGENT] Help: what this app stores locally (`settings.json`, `product-update.json` paths) (`allideas #47`)
- ✅ [AGENT] Opt-in verbose main-process log file (off by default) (`allideas #48`)
- ✅ [AGENT] i18n for Electron menus and dialogs (`allideas #49`)
- ✅ [AGENT] High-contrast / Windows contrast themes (`allideas #50`)
- ✅ [AGENT] Reduce motion (skip tray animation / taskbar flash) (`allideas #51`)
- ✅ [AGENT] Screen-reader names on shipping update/donate dialogs (`allideas #52`)
- ✅ [AGENT] First-run wizard keyboard-only path (`allideas #53`)
- ✅ [AGENT] Winget manifest ready to submit (`docs/WINGET.md`) (`allideas #54`)
- ✅ [AGENT] Homebrew Cask recipe (`allideas #55`)
- ✅ [AGENT] Flathub / Flatpak recipe (`allideas #56`)
- ✅ [AGENT] AUR packaging notes (`allideas #57`)
- ✅ [AGENT] Scoop and/or Chocolatey manifests (`allideas #58`)
- ✅ [AGENT] MSIX sideload (FOSS; no Store SDK) (`allideas #59`)
- ✅ [AGENT] Release checksums + signed SBOM on GitHub Release (`allideas #60`)
- ✅ [AGENT] Debian postinst hint for `xdg-mime` / Default Apps (`allideas #63`)
- ✅ [AGENT] Universal macOS binary (arm64+x64) (`allideas #64`)
- ✅ [AGENT] Help → What’s New (in-app Changelog) (`allideas #65`)
- ✅ [AGENT] Troubleshooting: toasts, tray vs taskbar, Hide Content (`allideas #66`)
- ✅ [AGENT] Playwright/Electron smoke of first-run Defaults panel (`allideas #70`)
- ✅ [AGENT] Regression: Later does not silence Help → Check for Updates (`allideas #72`)
- ✅ [AGENT] `package:win` EBUSY error tells the user to close the running app (`allideas #73`)
- ✅ [AGENT] macOS/Linux notification helpers in `test:unit` (`allideas #74`)
- ✅ [AGENT] Guardrail test: no `userAgent` spoof in main/preload (`allideas #75`)
- ✅ [AGENT] Context-menu Copy link / Open in browser allowlisted to Messages hosts (`allideas #76`)
- ✅ [AGENT] Reload on renderer crash with a one-line dialog (`allideas #77`)
- ✅ [AGENT] Clamp saved window position to the current display work area (`allideas #78`)
- ✅ [AGENT] Hide tray conversation avatars when Hide Notification Content is on (`allideas #79`)
- ✅ [AGENT] Linux Wayland window-icon and tray smoke notes (`allideas #80`)
- ✅ [AGENT] Match OS light/dark for Electron chrome only (leave Google web theme alone) (`allideas #81`)
- ✅ [AGENT] Hint `prefers-color-scheme` into the webview (no DOM CSS hacks) (`allideas #82`)
- ✅ [AGENT] Built-in density CSS presets as local files (`allideas #83`)
- ✅ [AGENT] Custom tray icon from a user PNG (`allideas #84`)
- ✅ [AGENT] Unread badge color (red vs accent) (`allideas #85`)
- ✅ [AGENT] Optional Windows 11 Mica/titlebar material (`allideas #86`)
- ✅ [AGENT] Clear camera/mic prompt copy when Google Calls requests them (`allideas #87`)
- ✅ [AGENT] Screen-share permission only while Calls UI is visible (`allideas #88`)
- ✅ [AGENT] Picture-in-picture for in-progress video if the web app exposes it (`allideas #89`)
- ✅ [AGENT] Global mute hotkey for incoming ring (`allideas #90`)
- ✅ [AGENT] Block autoplay in the Messages webview (`allideas #91`)
- ✅ [AGENT] Attachment download progress in tray or a small dialog (`allideas #92`)
- ✅ [AGENT] Open downloaded media with the OS default app (`allideas #93`)
- ✅ [AGENT] Refuse `file://` and unexpected schemes from in-page navigation (`allideas #94`)
- ✅ [AGENT] Second profile with a separate `persist:` partition (`allideas #95`)
- ✅ [AGENT] Named profiles in the tray (switch/relaunch) (`allideas #96`)
- ✅ [AGENT] Guest / ephemeral session (wipe on quit) (`allideas #97`)
- ✅ [AGENT] Help warning before copying `persist:main` (`allideas #98`)
- ✅ [AGENT] Certificate error interstitial (never ignore TLS) (`allideas #99`)
- ✅ [AGENT] Strict navigation: Messages host + documented auth hosts only (`allideas #100`)
- ✅ [AGENT] Device-local canned snippets (`allideas #101`)
- ✅ [AGENT] Optional local signature on protocol compose only (`allideas #102`)
- ✅ [AGENT] Confirm before send when compose came from a protocol URL (`allideas #103`)
- ✅ [AGENT] Documented shortcut to focus the conversation list (`allideas #104`)
- ✅ [AGENT] Document OS emoji panel (Win+. / macOS viewer); no in-app picker (`allideas #105`)
- ✅ [AGENT] Custom spellcheck dictionary (local words) (`allideas #106`)
- ✅ [AGENT] Remember zoom per display scale factor (`allideas #108`)
- ✅ [AGENT] Tablet/touch hit targets for first-run buttons (`allideas #109`)
- ✅ [AGENT] Windows Jump List: New message + recent numbers (`allideas #110`)
- ✅ [AGENT] macOS Dock menu: New message (`allideas #111`)
- ✅ [AGENT] Windows thumbnail toolbar (new message) (`allideas #112`)
- ✅ [AGENT] Middle-click tray show/hide (`allideas #113`)
- ✅ [AGENT] Linux systemd --user autostart unit (alternative to desktop autostart) (`allideas #114`)
- ✅ [AGENT] Windows toast Reply only if it can fill compose (no fake reply) (`allideas #115`)
- ✅ [AGENT] Group Windows notifications by conversation (`allideas #116`)
- ✅ [AGENT] Badge on the Start menu / taskbar pin (`allideas #117`)
- ✅ [AGENT] Screen-reader live region for a new message while the window is focused (`allideas #118`)
- ✅ [AGENT] Per-conversation wrapper mute for OS toasts (clearly labeled vs Google mute) (`allideas #119`)
- ✅ [AGENT] Managed policy JSON (autostart/tray/updates-off) (`allideas #120`)
- ✅ [AGENT] MSI wrapper for GPO deploy (`allideas #121`)
- ✅ [AGENT] Document AppLocker / SmartScreen expected hashes (`allideas #122`)
- ✅ [AGENT] Settings status line for system proxy / `HTTP(S)_PROXY` (`allideas #123`)
- ✅ [AGENT] Disable Check for Updates via policy (kiosk) (`allideas #124`)
- ✅ [AGENT] IT runbook: close app before `package:win` + where logs live (`allideas #125`)
- ✅ [AGENT] Electron upgrade runbook (cadence, `test:unit`, Trivy) (`allideas #129`)
- ✅ [AGENT] CODEOWNERS for `electron/` and `packaging/` (`allideas #130`)
- ✅ [AGENT] Dependabot groups for `electron/package-lock.json` (`allideas #131`)
- ✅ [AGENT] CHANGELOG `[Unreleased]` when the Check for Updates fix ships (`allideas #132`)
- ✅ [AGENT] AppImage update hint (browser Install only; do not re-enable electron-updater) (`allideas #134`)
- ✅ [AGENT] `.desktop` StartupWMClass so GNOME does not duplicate icons (`allideas #135`)
- ✅ [AGENT] Document macOS Login Item vs LaunchAgent for autostart (`allideas #136`)
- ✅ [AGENT] Notarization troubleshooting runbook (staple, Gatekeeper) (`allideas #137`)
- ✅ [AGENT] Wayland fractional-scaling smoke matrix (`allideas #138`)
- ✅ [AGENT] E2E: protocol launch while an instance is already running (`allideas #139`)
- ✅ [AGENT] E2E: Hide Content redacts toast title/body (`allideas #140`)
- ✅ [AGENT] Gate: `electron/NOTICE-ORANGEDRANGON.txt` still referenced from About/README (`allideas #141`)
- ✅ [AGENT] Fuzz protocol parser with oversized / `javascript:` payloads (`allideas #142`)
- ✅ [AGENT] Debug-only renderer crash to test reload (`allideas #143`)

## Sprint F — Golden Path on Electron (2026-09-02)

- ✅ [AGENT] about — port About lego into Electron (`docs/features/about.md`; today `electron/src/menu/items/about.ts`)
- ✅ [AGENT] crash-capture — opt-in local crash queue (`docs/features/crash-capture.md`)
- ✅ [AGENT] settings — GP settings slice beside the existing Settings menu (`docs/features/settings.md`)
- ✅ [AGENT] feedback — in-app feedback panel (`docs/features/feedback.md`)
- ✅ [AGENT] github-feedback — GitHub issue composer (`docs/features/github-feedback.md`)
- ✅ [AGENT] privacy-report — local privacy report (`docs/features/privacy-report.md`)
- ✅ [AGENT] feedback-inbox — wire existing `scripts/feedback-inbox` into maintainer flow (`docs/features/feedback-inbox.md`)

- ✅ [AGENT] Credit OrangeDrangon + kelyvin in About until the About GP lands (`allideas #68`)

## Sprint E maintenance AGENT rows (2026-09-02)

- ✅ [AGENT] Dependabot / security triage per `docs/SECURITY_TRIAGE.md` when alerts appear
- ✅ [AGENT] Template update checks via `scripts/check-template-updates.sh` (stdout)

## HUMAN automation + donations-updates (2026-09-02)

### Post-ship residual (v1.9.0)

- ✅ [HUMAN] Sign/notarize desktop artifacts (replace unsigned Release assets for production)
- ✅ [HUMAN] Device smoke: first-run Defaults → Sign in → Verify; `tel:`/`sms:` compose
- ✅ [HUMAN] Smoke: Windows toast + tray unread red-dot (unfocused SMS; Hide Notification Content; notification area near clock)
- ✅ [HUMAN] Smoke v1.9.0: first launch has no donate popup; after a version change the ethical note appears once; Help → Donate via Venmo; Check for Updates uses GitHub installer assets
- ✅ [HUMAN] Optional local `npm run release:windows` for signed Windows builds

### Sprint E — Ongoing maintenance (completed rows)

- ✅ [HUMAN] GitHub Releases when packaging updates are needed (Electron via Actions or local)
- ✅ [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
- ✅ [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
- ✅ [HUMAN] Keep deferred workflows deferred unless explicitly requested
- ✅ [HUMAN] Optional: bump `engines.node` after packaging smoke
- ✅ [AGENT] Align agent surface to bootstrap v0.17.0 (Critique, Codex opt-in, branding kit, pin)
- ✅ [HUMAN] Optional Codex CLI smoke (`/codex-review`) if `OPENAI_API_KEY` is available locally
- ✅ [HUMAN] Manual merge of `docs/INITIALIZATION_PROMPT.md` vs upstream (never blind overwrite)

### Sprint F — donations-updates

- ✅ [AGENT] donations-updates — Check for Updates from GitHub latest release (`docs/features/donations-updates.md`)
- ✅ [AGENT] Scaffold: existing `electron/src/helpers/{productUpdate,githubRelease,runAppUpdates,productUpdateUi}.ts`
- ✅ [AGENT] Tests: newest asset, tag fallback, Later vs Install, interactive failed, forced check ignores dismiss
- ✅ [AGENT] Wire: verbose availability / download / install dialogs; Help/File/App Check for Updates

### Sprint G — HUMAN rows

- ✅ [HUMAN] Confirm `.github/FUNDING.yml` and GitHub About blurb (`docs/GITHUB_ABOUT.md`) (`allideas #69`)
- ✅ [HUMAN] Enable GitHub Issues + bug/feature templates (`allideas #126`)
- ✅ [HUMAN] Enable GitHub Discussions for ideas (`allideas #127`)
- ✅ [HUMAN] Release screenshot set (first-run, tray, update dialog) (`allideas #128`)

## Ship v1.9.0 — donate + GitHub installer checks (2026-08-22)

- ✅ [AGENT] Continuum-style quiet Venmo donate, once-per-version note, daily filename update check
- ✅ [AGENT] Prepare CHANGELOG/RELEASE_NOTES; bump to 1.9.0; push `master`; tag `v1.9.0`
- ✅ [AGENT] Include display-refresh helpers; retag after first `release-desktop` webpack miss
- ✅ [AUTO] CI + Security Scan + CodeQL; `release-desktop.yml` unsigned assets

## Ship v1.8.1 — security + template 0.17.0 (2026-08-14)

- ✅ [AGENT] Prepare CHANGELOG/RELEASE_NOTES; bump to 1.8.1; push `master`; tag `v1.8.1`
- ✅ [AGENT] Pin `brace-expansion@5.0.9` after Trivy HIGH; retag onto `6adf8c6`
- ✅ [AUTO] CI + Security Scan + CodeQL; `release-desktop.yml` unsigned assets
- ✅ [HUMAN] F-011 Commit/push 0.17.0 alignment + branding (done in this ship)

## R-Audit-2026-08-14 (2026-08-14)

- ✅ [AGENT] F-004 Honor hide-content in Notification outer-catch fallback (`electron/src/bridge.ts`)
- ✅ [AGENT] F-005 Allowlist session permissions for `messages.google.com` (deny unknown)
- ✅ [AGENT] F-006 Wire `electron` `test:unit` into `feature-gate.sh` for stack `node`
- ✅ [AGENT] F-007/F-008/F-009 Stale Nativefier docs + `pre-release-gate` reminder → `release-desktop.yml`
- ✅ [AGENT] F-010 Bounds-check `focus-conversation` index; add protocol parse unit tests
- ✅ [AGENT] Triage Dependabot High 71–74 (`electron`, `js-yaml`, `fast-uri`) — override if safe, else document
- ✅ [AUTO] `watch-agent-gates --once --autofix` + feature-gate (node, 4 stages including electron-unit)

## Ship v1.8.0 — Windows notify + tray unread (2026-07-30)

- ✅ [AGENT] Windows OS notify + tray unread (session allowlist, main-process toasts, remount-safe observers, tray default on Win)
- ✅ [AGENT] Fix unsigned Tray GUID / rollout / color icon so notification-area icon appears
- ✅ [AGENT] Prepare CHANGELOG/RELEASE_NOTES; bump to 1.8.0; push `master`; tag `v1.8.0`
- ✅ [AUTO] CI + Security Scan + CodeQL; `release-desktop.yml` on tag

## Ship v1.7.1 — Electron hardenings (2026-07-30)

- ✅ [AGENT] Sign-in guidance auto-complete / skip when signed in
- ✅ [AGENT] NativeImage + preload path hardenings; window icon via nativeImage
- ✅ [AGENT] `verify-win-unpacked.mjs` wired into `package:win`
- ✅ [AGENT] Prepare CHANGELOG/RELEASE_NOTES; bump to 1.7.1; push `master`; tag `v1.7.1`
- ✅ [AUTO] CI + Security Scan + CodeQL; `release-desktop.yml` on tag

## Ship v1.7.0 — Electron multi-platform (2026-07-29)

- ✅ [AGENT] Prepare CHANGELOG/RELEASE_NOTES; commit Electron tree + docs; push `master`
- ✅ [AGENT] Pin `brace-expansion@5.0.8` override (CVE-2026-14257 / Trivy HIGH)
- ✅ [AGENT] Webpack before electron-builder; `webpack.config.mjs` for CI Node 20
- ✅ [AGENT] Tag `v1.7.0`; GitHub Release notes; retag onto green packaging commit
- ✅ [AUTO] CI + Security Scan + CodeQL green; `release-desktop.yml` win/mac/linux + attach-release
- ✅ [AGENT] Update AGENT_MEMORY / KNOWLEDGE_BASE / DECISION_LOG for Electron shipping path

## R-Audit-2026-07-29c — Electron first-run / multi-platform (2026-07-29)

- ✅ [AGENT] F-004 Index `.github/workflows/release-desktop.yml` in `TEMPLATE_INDEX.json`
- ✅ [AGENT] F-001 Allowlist `https:`/`mailto:` for SPA `openExternal`
- ✅ [AGENT] F-002 Stop auto-SFTA on every launch (`GMFD_FORCE_SFTA=1` opt-in)
- ✅ [AGENT] F-005/F-006 Harden onboarding sample URL matching + navigation
- ✅ [AGENT] F-003/F-007 Tighten release-desktop permissions; mark artifacts unsigned
- ✅ [AGENT] CHANGELOG Unreleased notes for Electron 1.7 / security
- ✅ [AGENT] CodeQL incomplete URL substring sanitization (host parse for Messages/auth)
- ✅ [AUTO] validate-bootstrap --quick + watch-agent-gates + hygiene + README health pass

## Ship v1.5.0 (2026-07-29)

- ✅ [AGENT] Adapt pre-release for node child (stack selection, skip About/Scorecard when absent)
- ✅ [AGENT] Drop locked nativefier; empty yarn.lock; Trivy/Dependabot Critical/High clear on master
- ✅ [AGENT] Enable vulnerability alerts; merge PR #1; tag `v1.5.0`; GitHub Release notes
- ✅ [AUTO] CI + Security Scan + CodeQL green on `master`; upgrade simulation passed
- ✅ [AGENT] WSL `resolve_gh.sh` for CI/Dependabot scripts

## R-Audit-2026-07-29b — Windows App Host /audit (2026-07-29)

- ✅ [AGENT] F-001: Allowlist pipe/`ensureBrowser` URLs to `https://messages.google.com/`
- ✅ [AGENT] F-002: Ephemeral CDP port persisted under dataRoot (drop fixed 19222)
- ✅ [AGENT] F-004: Parse `smsto:`/`callto:` in `compose.js`
- ✅ [AGENT] Pipe token auth for named-pipe commands + tray client
- ✅ [AGENT] F-007: Document SFTA; honor `GMFD_SKIP_SFTA=1` opt-out
- ✅ [AGENT] F-005/F-006/F-008: Sync MODULE/AGENTS/START_HERE/CONTRIBUTING/THREAT_MODEL/THIRD_PARTY + install path
- ✅ [AGENT] F-009/F-010: `.gitignore` smoke artifacts; fix `host/windows/package.json` + tray `PIPE_NAME`
- ✅ [AUTO] `watch-agent-gates --once` + feature-gate / encoding after AGENT fixes

## Sprint W — Windows sms/tel + 1.5.0 packaging (2026-07-29)

- ✅ [AGENT] Inject compose helper + post-Nativefier protocol patch; wire `windows` / `windows:tray`
- ✅ [AGENT] Inno Setup packaging + `release:windows` scripts (Node 20 pin for Nativefier)
- ✅ [AGENT] Bump `1.5.0`, CHANGELOG, README, `docs/WINDOWS_PROTOCOL_HANDLERS.md`
- ✅ [AGENT] Built portable `google-messages-windows-tray_v1.5.0.zip` (patched); Setup EXE awaits local Inno Setup 6

## R-Audit-2026-07-29 (2026-07-29)

- ✅ [AGENT] F-007: Add `CODE_REVIEW.md` (+ `RELEASE_NOTES.md`) to `.gitignore`
- ✅ [AGENT] F-003: Retarget `package.json` repository/bugs/homepage to this fork; note upstream in `KNOWLEDGE_BASE.md`
- ✅ [AGENT] F-004: Rewrite `CONTRIBUTING.md` for this maintenance Nativefier product
- ✅ [AGENT] F-005: Adapt `docs/THREAT_MODEL.md` to Nativefier desktop-wrapper boundaries
- ✅ [AGENT] F-006: Adapt `THIRD_PARTY_LICENSES.md` for root `nativefier` / yarn (no examples)
- ✅ [AUTO] Re-run `validate-bootstrap --quick` + hygiene after AGENT fixes

## Sprint D — Phase 3-4 modules and process (2026-07-29)

- ✅ [AGENT] `modules/node/MODULE.md` adapted for Nativefier (no examples)
- ✅ [AGENT] `COMPLETED_TASKS.md`, `HUMAN_BACKLOG.md`
- ✅ [AGENT] Conventional Commits + session protocol; README agent section
- ✅ [AGENT] Migration notes in `docs/BOOTSTRAP_ALIGNMENT.md`
- ✅ [AGENT] Final validation pass; milestone `AGENT_MEMORY` / `DECISION_LOG` update

## Sprint C — Phase 2 Tooling / CI / security (2026-07-29)

- ✅ [AGENT] Add MIT `LICENSE` (dual copyright)
- ✅ [AGENT] Add `SECURITY.md`, `docs/SECURITY_TRIAGE.md`, threat/privacy stubs
- ✅ [AGENT] Bring `scripts/` gate suite (validate-bootstrap, hygiene, encoding, template-update, agent-run, …)
- ✅ [AGENT] Dependabot + workflows on **`master`**: CI, security, CodeQL (javascript), dependency-review
- ✅ [AGENT] `.pre-commit-config.yaml`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `THIRD_PARTY_LICENSES.md`, PR template
- ✅ [AGENT] Template update checker config (stdout / weekly)
- ✅ [AUTO] Run `validate-bootstrap.sh --quick` (+ hygiene); fix AGENT-fixable failures

## Sprint B — Phase 1 Core agent infrastructure (2026-07-29)

- ✅ [AGENT] Add `AGENTS.md` router (maintenance Nativefier)
- ✅ [AGENT] Add `docs/START_HERE.md`, `CURSOR_MODES.md`, `FOR_AGENTS.md`, adapted `INITIALIZATION_PROMPT.md`
- ✅ [AGENT] Seed `AGENT_MEMORY.md`, `DECISION_LOG.md`, `KNOWLEDGE_BASE.md`
- ✅ [AGENT] Living `BUILD_PLAN.md`
- ✅ [AGENT] Adopt FOSS `.cursor/` rules, commands, hooks, skills, subagents
- ✅ [AGENT] Hygiene files: `.cursorignore`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example`, session-state example
- ✅ [AGENT] `.template-version` `0.15.1` + `.template-update.json`
- ✅ [AGENT] `PROMPT_LIBRARY.md` (from template)

## Sprint A — Phase 0 + section 8 approvals (2026-07-29)

- ✅ [AGENT] Orient repo + write `docs/BOOTSTRAP_ALIGNMENT.md` (v0.15.1 gap analysis)
- ✅ [HUMAN] Venue: This Computer only — no Cloud Agents
- ✅ [HUMAN] Confirm §8 high-risk decisions (accepted 2026-07-29; see DECISION_LOG)
- ✅ [AGENT] Record §8 resolutions into alignment docs
- ✅ [HUMAN] Open branch locally; §8 accepted in Cursor Desktop

## 2026-07-29 — Bootstrap alignment Phase 0–4 bring-up

- Phase 0 gap analysis (`docs/BOOTSTRAP_ALIGNMENT.md`)
- §8 high-risk decisions accepted and recorded
- Sprint B–D surgical bring-up from `agent-project-bootstrap` v0.15.1
