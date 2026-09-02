# Feature: feedback

> About / Help review dialogs for bug and feature reports. Not a donate nag. Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ User-visible behavior: Help (and the macOS app menu next to About) has Report a bug and Request a feature; review panel shows a text preview, Copy, Open GitHub, Discard
- ✅ Offline/error behavior: Copy still works; Open GitHub disabled with i18n reason; `https` GitHub only
- ✅ Accessibility: dialog window with labelled buttons; preview `role="region"`
- ✅ i18n: `feedback.*` in `electron/src/helpers/feedbackCopy.ts`

## Smoke scenario

1. Given crash-capture is off
2. When the user opens Help → Report a bug and types a description
3. Then they can copy the report; Open GitHub is enabled only when description exists and the app is online

## Container map

| Layer | Path |
|-------|------|
| View | `electron/src/helpers/feedbackPanelHtml.ts`, `electron/src/menu/items/feedback.ts` |
| Logic | `electron/src/helpers/feedbackPreview.ts` |
| Tests | `electron/src/helpers/feedbackPreview.test.ts` |
| Wiring | Help / app menu items; `electron/src/helpers/feedbackUi.ts` |
## Tests

- Automated: yes — XSS/escape, GitHub URL allowlist, preview uses `textContent`

## Fallback validation

- Why tests are not feasible: N/A (preview logic is unit-tested)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Definition of Done

See `docs/FEATURE_MODULES.md`. XSS test: preview never uses `innerHTML` of reporter text.

## Notes

- Settings toggle “Save crash details for me to review” defaults off (`feedback.save_crashes` / `settings.save_crashes`)
- Discard best-effort clears clipboard text we wrote
- Duplicate-search / fingerprint titles are `docs/features/github-feedback.md`
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
