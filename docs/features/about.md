# Feature: about

> Electron About lego for Google Messages for Desktop. Do not copy `examples/node/` over the app.

## Acceptance criteria

- ✅ User-visible behavior: Help/App menu opens About with product name, version, MIT license, FOSS/no-tracking note, Venmo donate link, OrangeDrangon + kelyvin credits
- ✅ Offline/error behavior: About opens with no network; donate link is a real URL
- ✅ Accessibility: dialog/window has a title; links are keyboard-reachable (`about-window`)
- ✅ i18n: user-visible strings keyed under `about.*` in `electron/src/helpers/aboutCopy.ts`

## Smoke scenario

1. Given the Electron app is running
2. When the user opens About from Help (Windows/Linux) or the app menu (macOS)
3. Then name, version, license, donate link, and credits are visible without console errors

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/aboutCopy.ts` |
| View | `electron/src/menu/items/about.ts` (`about-window`) |
| Tests | `electron/src/helpers/aboutCopy.test.ts` |
| Wiring | `electron/src/menu/helpMenu.ts` / `appMenu.ts` ≤10 lines |

## Tests

- Automated: yes — `aboutCopy.test.ts` (HTML copy, Venmo URL, credits)

## Fallback validation

- Why tests are not feasible: N/A (copy is unit-tested; `about-window` chrome is third-party)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Definition of Done

See `docs/FEATURE_MODULES.md`. Port patterns from the template About spec into `electron/`; never vendor `examples/`.

## Notes

- View: [`electron/src/menu/items/about.ts`](../../electron/src/menu/items/about.ts)
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
