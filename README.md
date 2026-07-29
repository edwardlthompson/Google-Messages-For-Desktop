# Google Messages for Desktop

> This project is currently in maintenance mode and no new features will be added. If you'd like to use a similar app with potential richer functionality, go check out [OrangeDragon's android-messages-desktop project](https://github.com/OrangeDrangon/android-messages-desktop)!

## How agents should work

Cursor agents: start at [`docs/START_HERE.md`](docs/START_HERE.md), then [`AGENTS.md`](AGENTS.md) and [`BUILD_PLAN.md`](BUILD_PLAN.md) (Sequential first).  
This Computer only — no Cloud Agents. Stack is `node` / FOSS alignment with [`agent-project-bootstrap`](https://github.com/edwardlthompson/agent-project-bootstrap) v0.15.1 (see [`docs/BOOTSTRAP_ALIGNMENT.md`](docs/BOOTSTRAP_ALIGNMENT.md)). Windows product path: Chromium App Host (`host/windows`).

![Google Messages Home Page](https://i.imgur.com/OVKBkNY.png)

A "native-like" desktop app for [Google Messages](https://messages.google.com/web).

| Platform | How it runs |
|----------|-------------|
| **Windows** | Thin host EXE (`GoogleMessages.exe`) + Chrome/Edge `--app` window via `chrome_proxy.exe` |
| **macOS / Linux** | [Nativefier](https://github.com/nativefier/nativefier) rebuild scripts |

**Why not Electron on Windows?** Google rejects sign-in in Electron/WebView2 (`signin/rejected` / blank SPA). Cookie import does not fix it. The UI must be a real Chrome or Edge process.

**Downloads:** [GitHub Releases](https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases) (this fork). Upstream history: [kelyvin/Google-Messages-For-Desktop](https://github.com/kelyvin/Google-Messages-For-Desktop).

## Purpose

Dedicated desktop entry points for Google Messages with OS notifications and (on Windows) `sms:` / `tel:` protocol handlers.

This desktop app and project is not an official product of Google and I am not affiliated with Google in any way.

## Windows setup (v1.5.0+)

### What you get

| Piece | Role |
|--------|------|
| `GoogleMessages.exe` | Tray, protocol handlers, single-instance, CDP compose |
| Chrome / Edge app window | Messages UI (`--app=` or `--app-id=`), launched via **`chrome_proxy.exe`** |
| Profile | `%LOCALAPPDATA%\GoogleMessages\chromium-profile` (dedicated; not your everyday browser) |
| App shortcut | `%LOCALAPPDATA%\GoogleMessages\Google Messages App.lnk` (matched AppUserModelID for taskbar pin) |

### Install & first run

1. Download **`GoogleMessagesSetup-1.5.0.exe`** (or portable `google-messages-windows-host_v1.5.0.zip`).
2. Install/launch **Google Messages** (requires **Chrome or Edge** on the machine).
3. Sign in inside the app window.
4. Defaults for phone links (host also sets UserChoice when allowed):
   - **Settings → Apps → Default apps → Google Messages** (assign **tel** and **sms**)
5. Test: `"GoogleMessages.exe" "tel:+15551234567"` or click a phone number in Chrome after step 4.

**Important:** both `sms:` and `tel:` open a **new text**. They do **not** place a voice call. `smsto:` / `callto:` are registered the same way.

### Tray & quiet start

- No args → host stays in the **system tray** (no console window).
- `--open`, tray **Open Messages**, or a `tel:`/`sms:` link → opens the Messages app window.
- Tray: **Open Messages** · **Sign out (clear profile)** · **Quit**

### Taskbar pin (not “Google Chrome”)

Pins must use Chromium’s app-shortcut model:

1. Open Messages once (`--open` or tray).
2. Unpin any old **Google Chrome** pin for this window.
3. Pin the Messages window again — shortcut targets `chrome_proxy.exe` with an AppUserModelID synced from the live window.

Details: [`docs/WINDOWS_PROTOCOL_HANDLERS.md`](docs/WINDOWS_PROTOCOL_HANDLERS.md).

### Build Windows release locally

Requires Node 18+ and [Inno Setup 6+](https://jrsoftware.org/isinfo.php) for the Setup EXE:

```powershell
npm run release:windows
```

Outputs: `dist/GoogleMessagesSetup-<version>.exe`, `dist/google-messages-windows-host_v<version>.zip`, `dist/Windows_Host/GoogleMessages.exe`.

Dev host (Node): `npm run host:dev`.

Optional: set `GMFD_SKIP_SFTA=1` to register protocol ProgIds without forcing Windows UserChoice defaults.

## Rebuilding the app

### Quick commands

| Command | What it does |
|---------|----------------|
| `npm run windows` / `windows:host` | Build Windows Chromium App Host EXE |
| `npm run release:windows` | Host + portable zip + Inno Setup EXE |
| `npm run host:dev` | Run the host under Node (dev) |
| `npm run mac` / `npm run linux` | Nativefier rebuilds (non-Windows) |

## Windows notes

### Notifications

Chrome/Edge show site notifications for the dedicated profile. Allow notifications for Messages when prompted; check Windows notification settings for Google Chrome/Edge if needed.

### Security notes (local)

- CDP debugging is loopback-only; port is written to `%LOCALAPPDATA%\GoogleMessages\cdp-port.json`.
- Named-pipe commands require a token in `%LOCALAPPDATA%\GoogleMessages\pipe.token`.
- Threat model: [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## Ubuntu Shortcut

Submitted by user [FlorentLM](https://github.com/kelyvin/Android-Messages-For-Desktop/issues/8), to create a shortcut for the Ubuntu launcher, please do the following:

1. Create and open the shortcut file
```bash
nano ~/.local/share/applications/Android-Messages.desktop
```

2. Copy and paste the following entry inside the file:

```ini
[Desktop Entry]
Version=1.0.0
Name=Google Messages
Comment=Send and recieve messages from your Android Phone
Keywords=Message;Messaging;Android;SMS
Exec=/path/to/installfolder/GoogleMessages
Icon=/path/to/installfolder/resources/app/icon.png
Terminal=false
Type=Application
Categories=Internet;Application;
StartupWMClass=android-messages-nativefier-f3cfa3
```

Be sure to replace /path/to/installfolder/ with your actual installation folder and Android Messages should appear along your other native apps.
