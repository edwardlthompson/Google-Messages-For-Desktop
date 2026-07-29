# Windows protocol handlers & Chromium App Host

## Architecture

Windows builds ship a **thin host** (`GoogleMessages.exe`), not Nativefier/Electron.

| Piece | Role |
|--------|------|
| Host EXE | Registers `sms:`/`tel:`, single-instance, **tray-only until needed**, CDP compose |
| Chrome / Edge app window | Launched via **`chrome_proxy.exe`** (or `msedge_proxy.exe`) + `--app=` / `--app-id=` |
| Profile | `%LOCALAPPDATA%\GoogleMessages\chromium-profile` |
| Log | `%LOCALAPPDATA%\GoogleMessages\gmfd-host.log` |
| App identity | `%LOCALAPPDATA%\GoogleMessages\chrome-app-identity.json` (synced window AUMID) |

The host EXE is a **Windows GUI** binary (no console). No args → tray only. `--open` or `tel:`/`sms:` → Messages app window.

**Electron / WebView2 are not used for the UI.** Google blocks sign-in there; cookie import still leaves a blank SPA.

**Taskbar pin:** shortcuts target `chrome_proxy.exe` (not `chrome.exe`) with an AppUserModelID **copied from the live Messages window** (typically `Chrome.messages.…`, not a custom host ID). That is Chromium’s supported way to avoid pins resolving to “Google Chrome”. After the first successful open, **unpin any old Chrome pin**, then pin the Messages window (or use Start Menu → Google Messages for the host/tray).

```text
tel:/sms: → GoogleMessages.exe (host / tray)
              → chrome_proxy.exe shortcut (matched AUMID)
              → Chrome --app Messages window + CDP compose
```

Both `sms:` and `tel:` mean **new text** (not voice).

## Protocol registration

On every host launch (and via the Inno installer) the app writes:

- ProgIds **`GoogleMessages.sms`** / **`GoogleMessages.tel`** (also `smsto` / `callto`)
- `Software\Classes\tel` (and `sms`) open commands → `%LOCALAPPDATA%\Programs\GoogleMessages\GoogleMessages.exe`
- UserChoice defaults via vendored PS-SFTA (skip with `GMFD_SKIP_SFTA=1`)
- Pipe auth token + CDP port file under `%LOCALAPPDATA%\GoogleMessages\` (`pipe.token`, `cdp-port.json`)
- **`Software\Clients\GoogleMessages\Capabilities`** + `URLAssociations` (same layout as Chrome/Brave)
- `Software\RegisteredApplications` → that Capabilities path (**HKCU and HKLM** when permitted)
- Start Menu shortcut: **Google Messages**

Browser “Suggested apps” for phone links comes from **HKLM** Default Programs entries. Per-user-only registration is why Chrome/Brave showed up earlier but Google Messages did not.

The host also sets **UserChoice** (hashed, via vendored [PS-SFTA](https://github.com/DanysysTeam/PS-SFTA)) so `tel:` / `sms:` default to Google Messages. That skips the Suggested-apps list that only shows browsers.

### Make TEL/SMS open Google Messages from the browser

1. Run `GoogleMessages.exe` once (registers + sets UserChoice).
2. Click a phone number / `tel:` link in Chrome or Brave.
3. If Chrome asks **Open Google Messages?**, click **Open** (once per site is normal).
4. You should **not** need the old “Suggested apps” list (Node / Brave / Chrome only).

Verified smoke: OS `start tel:+…` launches the host and compose. Registry UserChoice ProgId = `GoogleMessages.tel` / `GoogleMessages.sms`.

## Build / release

```powershell
npm run windows:host          # dist/Windows_Host/GoogleMessages.exe
npm run release:windows       # host + zip + Inno Setup EXE
npm run host:dev              # run host under Node (dev)
```

Requires **Chrome or Edge** on the machine. Build machine needs Node 18+ and (for the Setup EXE) Inno Setup 6+.

## Tray

- **Open Messages** — focus/start the Chromium app window  
- **Sign out** — delete the dedicated profile  
- **Quit** — stop host and Chromium app processes for this profile  

## Compose (`sms:` / `tel:`)

The host parses the URI, opens conversations, and runs a CDP script (ported from the old Electron inject) to click **Start chat** and fill the number. Retries if the SPA is still loading.

## Legacy Nativefier (mac/linux)

macOS/Linux scripts may still use Nativefier. Windows shipping path is the Chromium App Host only.
