# Feature: window-shell

> Always on top, zoom persist, find in page, close-to-tray confirm, hardware acceleration, reset bounds. Single-instance lock already lives in `background.ts`.

## Acceptance criteria

- ✅ Always on top persists via `settings.json`
- ✅ Zoom factor clamped 0.5–3 and restored after load
- ✅ Edit → Find (Ctrl+F) injects a local find bar (`webContents.findInPage`)
- ✅ Close box asks Quit vs tray (Windows/Linux when tray is on); macOS still hides
- ✅ Offline banner + Reload on main-frame load failure
- ✅ Optional local `user.css` (remote `@import` rejected)
- ✅ Density presets from local `resources/density/*.css`
- ✅ `nativeTheme.themeSource` hints `prefers-color-scheme` (no page CSS)
- ✅ Export / import / reset `settings.json`
- ✅ Spell-check language allowlist
- ✅ Find, print, download folder, shortcuts Help page
- ✅ Saved window position clamped to the work area
- ✅ Zoom factor remembered per display `scaleFactor`

## Smoke scenario

1. Given tray enabled and close preference Ask
2. When the user clicks the window close box
3. Then a dialog offers Minimize to tray or Quit, with Remember

## Container map

| Layer | Path |
|-------|------|
| Logic | `closeBehavior.ts`, `windowPrefs.ts`, `findInPage.ts` |
| View | Settings + Edit → Find bar |
| Tests | `closeBehavior.test.ts`, `windowPrefs.test.ts`, `findInPage.test.ts` |
| Wiring | `background.ts`, `windowPrefsUi.ts`, `closeBehaviorUi.ts`, `findInPageUi.ts`, `preload/findBar.ts` |

## Tests

- Automated: yes — close resolution, zoom clamp, find query clamp

## Fallback validation

- Command: `python scripts/agent-run.py feature-gate --stack node`
