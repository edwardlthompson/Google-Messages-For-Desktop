# Feature: first-run Playwright smoke

> Smoke the Defaults onboarding HTML. Full Electron launch is optional (`npx playwright test` in `electron/` after `npx playwright install chromium`). Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ Defaults panel HTML includes protocol Open buttons, Continue, Skip, and Tab/Enter copy
- ✅ Playwright spec opens `onboarding.html` and asserts Continue is disabled
- ✅ Offline: no network; file URL only
- ✅ Keyboard: Tab/Enter documented on the panel

## Smoke scenario

1. Given `electron/resources/onboarding.html`
2. When the Playwright spec loads the file URL (or `onboardingPanel.test.ts` reads the HTML)
3. Then Continue stays disabled until handlers are marked set, and protocol Open buttons are present

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/onboardingKeyboard.ts`, `onboardingPanel.test.ts` |
| View | `electron/resources/onboarding.html` |
| Tests | `electron/src/helpers/onboardingPanel.test.ts`, `electron/e2e/onboarding.spec.ts` |
| Wiring | first-run BrowserWindow in `electron/src/helpers/onboarding.ts` |

## Tests

- Automated: yes — `electron/src/helpers/onboardingPanel.test.ts` (HTML fixture, in `test:unit`)
- Optional: `npm run test:e2e` in `electron/` (Playwright; install Chromium first)

## Fallback validation

- Command: `python scripts/agent-run.py feature-gate --stack node`
