# Windows protocol handlers & Electron app

## First-run (v1.7+)

1. **Defaults** — sample protocol links are association-only (compose suppressed via `onboardingMode`).
2. **Sign in** — guidance window + main Messages window; auto-dismisses once signed-in is detected (and is skipped on later launches).
3. **Verify** — optional test SMS after signed-in detection (available briefly before auto-dismiss).

See [`electron/resources/onboarding.html`](../electron/resources/onboarding.html) and [`signin-guidance.html`](../electron/resources/signin-guidance.html).

## Architecture

Windows builds ship an **Electron** app under [`electron/`](../electron/) (shell derived from [OrangeDrangon/android-messages-desktop](https://github.com/OrangeDrangon/android-messages-desktop)).

| Piece | Role |
|--------|------|
| Electron main (`background.ts`) | Window, tray, single-instance, protocol compose |
| Renderer | Loads `https://messages.google.com/web/` in `partition: "persist:main"` |
| Auth | `setWindowOpenHandler` opens Google auth URLs as modal windows on the **same** partition |
| Protocols | `sms:` / `tel:` / `smsto:` / `callto:` / `im:` → open app; phone forms also compose |
| Windows client type | Registered under `Software\Clients\IM\GoogleMessages` (Instant Messaging) |

**Differentiator vs OrangeDrangon:** they do not register phone-number / IM protocols; we do.

```text
tel:/sms:/im: → Google Messages (Electron)
                  → focus window (+ compose script when a number is present)
```

Both `sms:` and `tel:` mean **new text** (not voice). Bare `im:` opens/focuses the app. Test page: Help → **Protocol Test Links…** (`electron/resources/protocol-test-links.html`).

### Legacy Chromium App Host

[`host/windows`](../host/windows) (Chrome/Edge `--app` + CDP) is **deprecated** for shipping but kept for rollback (`npm run windows:host`). Prefer Electron.

## Protocol registration

On Electron ready (Windows):

- `app.setAsDefaultProtocolClient` for each scheme
- ProgIds **`GoogleMessages.sms`** / **`.tel`** / **`.smsto`** / **`.callto`** / **`.im`**
- `Software\Classes\…` open commands → Electron `process.execPath` `"%1"`
- UserChoice defaults via vendored PS-SFTA **only when** `GMFD_FORCE_SFTA=1` (not on every launch; onboarding uses OS chooser / Settings)
- Opt out of forced SFTA remains `GMFD_SKIP_SFTA=1` when force is enabled
- **`Software\Clients\IM\GoogleMessages\Capabilities`** + `URLAssociations` (IM client type)
- `Software\RegisteredApplications` → Capabilities path (HKCU)

Implementation: [`electron/src/helpers/protocols.ts`](../electron/src/helpers/protocols.ts), compose expression: [`electron/src/helpers/compose.ts`](../electron/src/helpers/compose.ts).

## Dev / build

```powershell
npm run electron:dev
npm run release:windows
```

See [`electron/README.md`](../electron/README.md).
