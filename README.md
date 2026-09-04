# Google Messages for Desktop

<p align="center">
  <img src="branding/assets/readme-hero.svg" alt="Google Messages for Desktop mark" width="960" />
</p>

<p>
  <img src="https://img.shields.io/badge/template-1.0.0-656d76?style=flat-square" alt="template 1.0.0" />
  <img src="https://img.shields.io/badge/license-MIT-2ea043?style=flat-square" alt="MIT" />
  <img src="https://img.shields.io/badge/FOSS-no_tracking-656d76?style=flat-square" alt="FOSS" />
  <a href="https://github.com/edwardlthompson/Google-Messages-For-Desktop/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/edwardlthompson/Google-Messages-For-Desktop/ci.yml?style=flat-square&label=CI" alt="CI" /></a>
  <img src="https://img.shields.io/badge/node-stack-1A73E8?style=flat-square" alt="node" />
  <img src="https://img.shields.io/badge/AGENT-2ea043?style=flat-square" alt="AGENT" />
  <img src="https://img.shields.io/badge/HUMAN-0969da?style=flat-square" alt="HUMAN" />
  <img src="https://img.shields.io/badge/ADB-bf8700?style=flat-square" alt="ADB" />
  <img src="https://img.shields.io/badge/AUTO-656d76?style=flat-square" alt="AUTO" />
</p>

A dedicated desktop app for [Google Messages for web](https://messages.google.com/web) — Electron window, tray options, and OS handlers for messaging links.

**Not** an official Google product and not affiliated with Google.

## Pitch

A dedicated Electron window for [Google Messages for web](https://messages.google.com/web), with tray options and OS handlers so `sms:` / `tel:` links open this app instead of a browser.

| Platform | Package |
|----------|---------|
| **Windows** | NSIS installer, portable EXE, zip |
| **macOS** | dmg, zip (build on macOS or [GitHub Actions](.github/workflows/release-desktop.yml)) |
| **Linux** | AppImage, deb, zip (build on Linux or Actions) |
**Downloads:** [GitHub Releases](https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases) — Windows users can install with the NSIS Setup EXE or run the **portable** `.exe` / `.zip` without installing.
**Version:** 1.10.1 (see [CHANGELOG](CHANGELOG.md))

## Support / Donate

Support development on [Venmo](https://venmo.com/code?user_id=1857304970395648420).
In the app: **Help → Donate via Venmo** (also linked from About).

## Check for Updates

**Help → Check for Updates** (also on the File / app menu) asks GitHub for the latest **Release installer** for this OS. If something newer is there, **Install** opens the download page; **Later** dismisses that version until you check again from the menu. The app does **not** silently download or run an updater. Failed checks offer the releases page instead of pretending you are up to date.

## Credits

Electron shell based on [OrangeDrangon/android-messages-desktop](https://github.com/OrangeDrangon/android-messages-desktop) (MIT; Chris Knepper / Kyle Rosenberg). See [`electron/NOTICE-ORANGEDRANGON.txt`](electron/NOTICE-ORANGEDRANGON.txt).

**What makes this app different:** registers `sms:` / `tel:` / `smsto:` / `callto:` / `im:` so phone and messaging links can open Google Messages and start a new text, with a first-run defaults checklist. OrangeDrangon’s app does not.

Upstream history: [kelyvin/Google-Messages-For-Desktop](https://github.com/kelyvin/Google-Messages-For-Desktop).

## Features

- Dedicated Messages window (no full Chrome/Edge browser chrome)
- Google sign-in in-app (shared session + auth modals)
- Protocol handlers that compose a **new text** (not a voice call)
- First-run: **Defaults → Sign in → optional Verify**
- Tray / start-in-tray (from the OrangeDrangon-derived shell) — **minimize to tray** keeps the process warm so reopen skips the long cold Google web load (no local message caching); new installs default close-to-tray
- Windows OS toasts and tray unread red-dot; native toasts on macOS and Linux
- Quiet **Donate via Venmo** in Help / About (no launch nag)
- **Help → Check for Updates** looks at GitHub Release installer assets (Later vs Install; no silent download)
- Windows, macOS, and Linux builds from the same [`electron/`](electron/) app

## First-run (v1.10.1)

1. **Defaults** — Click each sample link (`sms:`, `smsto:`, `tel:`, `callto:`, `im:`) and choose **Google Messages**. These samples only set associations; they do **not** require you to be signed in and do not compose a message.
2. **Sign in** — In the main window, sign in with Google and pair your phone (QR) if asked.
3. **Verify (optional)** — After you’re signed in, use the guidance panel’s test SMS link (or **Help → Protocol Test Links…**).

Re-open the defaults wizard anytime: **Settings → Set as Default Messaging App…**

### Windows Default apps

- The app registers as a messaging client for those URL schemes.
- Windows does **not** force itself as the default on every launch. Pick Google Messages in the chooser or in **Settings → Apps → Default apps**.
- Optional advanced: set `GMFD_FORCE_SFTA=1` to force UserChoice via PS-SFTA (enterprise/testing). Details: [`docs/WINDOWS_PROTOCOL_HANDLERS.md`](docs/WINDOWS_PROTOCOL_HANDLERS.md).

## Quick start

Requires **Node 20+**.

```powershell
# Dev
npm run electron:dev

# Windows release artifacts → electron/dist/ and dist/
npm run release:windows

```

```bash
# macOS or Linux (run on that OS)
bash scripts/desktop/release-electron.sh
# or: npm run release:mac   /   npm run release:linux

```

CI packages all three platforms on tag `v*` or `workflow_dispatch`: [`.github/workflows/release-desktop.yml`](.github/workflows/release-desktop.yml).
Actions artifacts are **unsigned smoke builds** unless you add signing secrets; prefer signed installers for production.

### Quick commands

| Command | What it does |
|---------|----------------|
| `npm run electron:dev` | Run Electron (dev) |
| `npm run windows` / `release:windows` | Package Windows |
| `npm run mac` / `release:mac` | Package macOS (on macOS) |
| `npm run linux` / `release:linux` | Package Linux (on Linux) |
### Legacy (rollback only)

| Command | What it does |
|---------|----------------|
| `npm run windows:host` / `release:windows:host-legacy` | Old Chromium App Host (Chrome/Edge `--app`) |
| `npm run mac:nativefier-legacy` / `linux:nativefier-legacy` | Old Nativefier wrappers |
## Docs for agents & contributors

- Start: [`docs/START_HERE.md`](docs/START_HERE.md)
- Agents: [`AGENTS.md`](AGENTS.md) · board: [`BUILD_PLAN.md`](BUILD_PLAN.md)
- Protocols: [`docs/WINDOWS_PROTOCOL_HANDLERS.md`](docs/WINDOWS_PROTOCOL_HANDLERS.md)
- Threat model: [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md)
- Bootstrap alignment: [`docs/BOOTSTRAP_ALIGNMENT.md`](docs/BOOTSTRAP_ALIGNMENT.md)

This Computer only — no Cursor Cloud Agents. Stack: `node` / FOSS (`agent-project-bootstrap` v1.0.0).

## Contributing

Issues and PRs welcome. Humans: [`CONTRIBUTING.md`](CONTRIBUTING.md). Agents: [`docs/START_HERE.md`](docs/START_HERE.md) and [`AGENTS.md`](AGENTS.md).

## Security

Do not file vulnerabilities in public issues. See [`SECURITY.md`](SECURITY.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## License

MIT. Dual copyright in [`LICENSE`](LICENSE) (Kelvin Nguyen; Edward L. Thompson). Electron shell credit: OrangeDrangon (MIT).
