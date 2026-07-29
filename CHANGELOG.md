# Changelog

All notable changes to Google Messages for Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
