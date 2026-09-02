# Feature: verbose-log

> Opt-in main-process log file. Off by default. Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ User-visible behavior: Settings checkbox writes `main.log` under Electron userData; Open main.log… reveals the file
- ✅ Offline/error behavior: disk write failures are swallowed; logging never blocks the UI
- ✅ Accessibility: native Settings menu checkbox
- ✅ i18n: `settings.verbose_log` and `settings.verbose_log_open`

## Smoke scenario

1. Given a new install
2. When verbose logging is off
3. Then `console.log` is not mirrored to disk
4. When the user enables the setting and restarts, console log/warn/error lines append to `main.log` (capped per line)

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/verboseLog.ts` |
| View | Settings checkbox + Open main.log… |
| Tests | `electron/src/helpers/verboseLog.test.ts` |
| Wiring | `electron/src/background.ts` `bindVerboseMainLog()` |

## Tests

- Automated: yes — line join and length cap

## Fallback validation

- Why tests are not feasible: N/A (format is unit-tested; wrap is Electron console)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Notes

- Does not log Messages conversation bodies from the webview
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
