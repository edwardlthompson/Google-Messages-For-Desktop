# Feature: settings

> Golden Path settings slice beside the existing Electron Settings / Preferences menu. Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ User can open Settings from the app menu (Preferences on macOS)
- ✅ Appearance preference (light / dark / system) persists across restarts via `settings.json`
- ✅ `nativeTheme.themeSource` hints `prefers-color-scheme` into the webview (no DOM CSS)
- ✅ Density presets inject local `resources/density/*.css` only
- ✅ Custom tray PNG (local file), unread badge red vs accent, optional Windows 11 Mica
- ✅ Main / Work / Personal Chromium partitions (default remains `persist:main`); Guest wiped on quit
- ✅ Optional **Save crash details for me to review** toggle (default off); see `docs/features/feedback.md` and `docs/features/crash-capture.md`
- ✅ Daily GitHub installer checks are not gated here (see `docs/features/donations-updates.md`)
- ✅ Offline: settings load last persisted values; no network required for display
- ✅ i18n: settings surface strings under `settings.*`; Spanish overlay in `catalogEs.ts` via `localizedCatalog`
- ✅ Opt-in **Write verbose main-process log** (`main.log` under userData; default off; wrap starts on next launch)

## Smoke scenario

1. Given the app is running with default (system) appearance
2. When the user opens Settings and switches Appearance to Dark
3. Then native window chrome uses dark immediately and still uses dark after a cold restart

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/settingsTheme.ts` |
| View | `electron/src/menu/settingsMenu.ts` |
| Tests | `electron/src/helpers/settingsTheme.test.ts`, `settingsCopy.test.ts` |
| Wiring | `electron/src/background.ts` `bindAppTheme(mainWindow)` |
## Tests

- Automated: yes — theme parse/persist colors; settings copy keys

## Fallback validation

- Why tests are not feasible: N/A (preference logic is unit-tested; Google Messages web keeps its own theme)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Out of scope (this slice)

- Account sync, cloud backup, analytics
- Donation URL editing (stays in About / Help)
- Restyling the Google Messages SPA

## Notes

- `nativeTheme.themeSource` plus window background; the webview is still messages.google.com
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
