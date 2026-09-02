# Feature: crash-capture

> Opt-in local crash queue for the Electron desktop app. Never auto-sends. Sanitize before persist. Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ User-visible behavior: after a captured crash, one review dialog; never auto-open GitHub
- ✅ Offline/error behavior: write failure drops the record; handler errors do not re-enter
- ✅ Accessibility: native dialog with Review / Dismiss; no GitHub link
- ✅ i18n: uses `feedback.*` keys in `electron/src/helpers/pendingCrash.ts`

## Smoke scenario

1. Given the save-crashes setting is off
2. When an unhandled error occurs
3. Then nothing is persisted
4. When the setting is on, at most one sanitized record is stored; turning the setting off deletes it

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/pendingCrash.ts` |
| View | Settings checkbox + `electron/src/helpers/crashCapture.ts` dialog |
| Tests | `electron/src/helpers/pendingCrash.test.ts` |
| Wiring | `electron/src/background.ts` ≤10 lines (`initCrashCapture` + `presentPendingCrashIfAny`) |
## Tests

- Automated: yes — `pendingCrash.test.ts` (opt-in off, at most one, sanitize, no re-entry, allowlist keys)

## Fallback validation

- Why tests are not feasible: N/A (queue logic is unit-tested; dialog chrome is Electron)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Definition of Done

Unit tests for queue-at-most-one, sanitize-before-persist, opt-in false, no re-entry. Fallback: `[HUMAN]` manual throw smoke.

## Notes

- Persist `pending-crash.json` under Electron `userData` (`message` + `stack` only)
- Settings → **Save crash details for me to review** defaults off (`feedback.save_crashes`)
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
