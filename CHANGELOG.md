# Changelog

All notable changes to Google Messages for Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.10.1] - 2026-09-02

### Added

- Local launch splash so the first window appears before Google Messages for web paints

### Changed

- Windows protocol registry writes run after the first window is shown (they no longer block startup)

## [1.10.0] - 2026-09-02

### Added

- Protocol compose honors `sms:?body=` and `smsto:number:body` (capped, rejects `javascript:` / oversized URLs)
- Settings: **Check for updates on launch** and **Start with the operating system**
- Help protocol test links include a prefilled message body
- Clicking an OS toast focuses the matching conversation when the web app list allows it
- Quiet hours, notification sound, always on top, find in page (Ctrl+F), close-to-tray confirm
- Help → Troubleshooting (toasts vs tray, Hide Content, local files, paste image, OS emoji)
- Offline banner with Reload; local `user.css`; export/import/reset settings; spell-check language; Ctrl+P print; download folder
- Explicit camera/mic prompt the first time Google Calls asks this session
- Opt-in Settings → **Write verbose main-process log** (`main.log` in user data; off by default, restart to start writing)
- Electron menus and dialogs follow the OS locale when Spanish (`es*`); other locales stay English
- High-contrast OS theme uses black/white window chrome; Settings → Reduce motion skips taskbar flash; first-run wizard is Tab/Enter
- Help → What’s New; packaging recipes (Winget/Homebrew/Flatpak/AUR/Scoop/MSIX)
- Density presets, custom tray PNG, unread badge red vs accent, optional Windows 11 Mica
- Calls camera/mic and screen-share prompts; Ctrl+Shift+M mute; download progress + open media; Ctrl+Shift+L focus conversation list
- Main/Work/Personal Chromium partitions plus Guest (wiped on quit); TLS certificate interstitial (never ignored)
- Clipboard snippets, optional protocol-only signature, confirm before sms/tel compose
- Zoom remembered per display scale; Jump List / Dock / thumbnail New message; tray middle-click; systemd user unit recipe
- Managed `managed-policy.json` (autostart/tray/updates-off); proxy status in Settings; no fake toast Reply

### Changed

- Check for Updates from the menu still offers a newer installer after **Later** (launch checks stay dismissed)
- New installs default **Hide Notification Content** on (existing `settings.json` is unchanged)

### Fixed

- Native toasts on Linux set `urgency: normal` so they match Windows unfocused-message behavior
- Tray avatars hide when Hide Notification Content is on
- Pin Electron `fast-uri` 3.1.6 and `@xmldom/xmldom` 0.8.15 (lockfile HIGH/Medium)
- Allowlist privacy-report sanitizer fixtures in `.gitleaks.toml`; install bootstrap lint CLIs in CI

## [1.9.0] - 2026-08-22

### Added

- Quiet **Donate via Venmo** in Help, About, and the macOS app menu (no launch nag)
- Once-per-version optional donate note after an update (“Development is still going”)
- Daily GitHub installer check (filename versions, not git tags) with **Install** / **Later**

### Changed

- Update prompts open the matching GitHub asset URL instead of electron-updater auto-download

### Fixed

- Release packaging includes display-refresh helpers required by the main process webpack build

## [1.8.1] - 2026-08-14

### Security

- Session permissions on `persist:main` are allowlisted (notifications, clipboard, fullscreen, media) for `messages.google.com` only
- Notification outer-catch fallback no longer forwards raw page title/body (hide-content honored in main)
- Electron **41.10.3** (GHSA-9f4c-93c8-jc8g); pin transitive `fast-uri@3.1.5`, `js-yaml@4.3.1`, and `brace-expansion@5.0.9`

### Changed

- Agent/process surface aligned to agent-project-bootstrap **v0.17.0** (resolved Critique, `/codex-review`, expanded `/prerelease`, product-mapped `branding/` kit)
- Node feature-gate runs `electron` `test:unit`
- Gate scripts pick a real Python via `scripts/lib/pick-python.sh` (skip Windows Store `python3`)

## [1.8.0] - 2026-07-30

### Added

- Windows OS toasts for new messages via main-process Electron `Notification` (session allowlist for `messages.google.com`)
- Unread tray red-dot with remount-safe conversation-list observers
- Unread false→true toast fallback when the web app suppresses HTML5 notifications
- `npm run test:unit` for notification sanitize/dedupe and unread detection helpers

### Fixed

- Tray icon missing on unsigned Windows builds (omit Tray GUID; resize oversized tray PNGs)
- Existing Windows installs kept `trayEnabled: false` — one-time `windowsTrayRolloutV1` enables tray + color icon

### Changed

- Windows defaults: tray on for new settings; color tray icon preferred over monochrome

## [1.7.1] - 2026-07-30

### Fixed

- Sign-in guidance auto-completes when conversation list is detected (skip reopen on later launches)
- Tray/notification/update icons: skip invalid NativeImage / non-`data:image` URLs
- Preload bridge path always resolves beside `background.js` (no `app/app/bridge.js`)
- Windows `package:win` verifies `win-unpacked` includes Chromium ICU/pak/locales (incomplete package crash)

### Changed

- Window icon set via `nativeImage` on all platforms

## [1.7.0] - 2026-07-29

### Added

- Electron multi-platform app (`electron/`) with first-run Defaults → Sign in → Verify
- `sms:` / `tel:` / `smsto:` / `callto:` / `im:` protocol compose; association-only onboarding probes
- macOS/Linux electron-builder packaging + `.github/workflows/release-desktop.yml`
- Venmo donate link in README / Help / About

### Changed

- Windows shipping path is Electron (Chromium App Host / Nativefier are legacy)
- SFTA UserChoice no longer forced on every launch (opt-in `GMFD_FORCE_SFTA=1`)
- `shell.openExternal` from Messages webview limited to `https:` / `mailto:`
- Electron `package:*` scripts run webpack before electron-builder (`app/background.js`)

### Security

- Block non-https/mailto `openExternal` from SPA window-open handler
- Onboarding navigation only opens sample association URLs
- npm `overrides` pin `brace-expansion@5.0.8` (CVE-2026-14257 / Trivy HIGH in Electron lockfile)

## [1.5.0] - 2026-07-29

### Added

- Windows **Chromium App Host** ([`host/windows`](host/windows)): thin EXE + Chrome/Edge `--app` UI (Google blocks Electron/WebView2 login)
- Full HKCU **`sms:` / `tel:`** registration (ProgIds + RegisteredApplications) on every host launch
- CDP compose for protocol URLs (ported from Electron inject)
- Tray helper, single-instance named pipe, `%LOCALAPPDATA%\GoogleMessages` profile/log
- Windows taskbar identity via `chrome_proxy.exe` + live window AppUserModelID sync
- Named-pipe auth token (`pipe.token`) and ephemeral CDP port file (`cdp-port.json`)
- `smsto:` / `callto:` compose parsing; `GMFD_SKIP_SFTA=1` to skip UserChoice forcing
- Inno Setup installer ([`packaging/windows/GoogleMessages.iss`](packaging/windows/GoogleMessages.iss)) and `npm run release:windows`
- [`docs/WINDOWS_PROTOCOL_HANDLERS.md`](docs/WINDOWS_PROTOCOL_HANDLERS.md)
- Surgical agent-project-bootstrap **v0.15.1** alignment (FOSS Cursor surfaces, scripts, security docs, conservative CI on `master`)
- MIT `LICENSE` with dual copyright (Kelvin Nguyen; Edward L. Thompson)
- `docs/BOOTSTRAP_ALIGNMENT.md` Phase 0 gap analysis and locked §8 decisions

### Changed

- Windows shipping path is the Chromium App Host (not Nativefier/Electron)
- README documents App Host architecture (tray, pin, protocols, security notes)
- Drop locked `nativefier` dependency; mac/linux use `npx nativefier@49.0.1`
- Expanded `.gitignore` for agent/tooling hygiene while keeping `dist/` and `node_modules/` ignored
- `package.json` repository URLs point at `edwardlthompson/Google-Messages-For-Desktop`

### Security

- Allowlist `ensureBrowser` / CDP navigate to `https://messages.google.com/` only

## [1.4.2] - prior

Product packaging release (see git history / GitHub Releases). Nativefier wrapper for Google Messages Web.
