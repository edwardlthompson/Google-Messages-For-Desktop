# Feature: donations-updates

> Continuum Calendar method: quiet Venmo donate, one optional note after a version change, and a silent daily GitHub installer check.

## Acceptance criteria

- ✅ Quiet **Donate via Venmo** in About and the app menu; never on the update/install dialog
- ✅ First run records the installed version with no donate popup
- ✅ After a later launch where the installed version changed: one optional note (Donate via Venmo | Not now); either button records “seen this version”
- ✅ Once per 24 hours, fetch GitHub `releases/latest` (User-Agent + 10s timeout); pick the **newest** matching installer filename for this OS; if none match, fall back to `tag_name` + the release page URL
- ✅ Newer version and not dismissed on launch: **Install** | **Later**; Install opens the URL in the browser and does not write `dismissedVersion`; Later silences that version for launch nag only
- ✅ Help/File/App **Check for Updates** ignores Later (`ignoreDismissed`) so a postponed version can be offered again; it names current vs latest, the download file, and that install is in the browser
- ✅ Launch: failed fetch, timeout, or same version stay silent. Interactive check: failed fetch shows Open releases page / Dismiss; same version shows you're up to date
- ✅ Donate prefs and last-check timestamps are device-local (not peer-synced; Android Auto Backup excludes `gp_updates`)
- ✅ No dark patterns: no fake close, no guilt copy, no paywalling updates
- ✅ Offline/error: no network required for donate links or first-run version record
- ✅ Accessibility: dialogs are `role="dialog"` with labelled buttons; donate is a real link/button
- ✅ i18n: `about.donate*`, `about.not_now`, `about.update.install`, `about.update.later`

## Smoke scenario

1. Given a fresh install, the app records the version and does not show a donate note
2. When the installed version changes on a later launch, the ethical reminder appears once
3. Then either button hides it until the next version change; a newer installer asset can show Install | Later separately

## Container map

| Layer | Electron (this product) |
|-------|-------------------------|
| Logic | `electron/src/helpers/productUpdate.ts`, `productUpdateCopy.ts` |
| Fetch/prefs | `githubRelease.ts`, `updatePrefs.ts`, `runAppUpdates.ts` |
| View | `productUpdateUi.ts` (dialog copy + Later vs Install) |
| Tests | `productUpdate.test.ts`, `productUpdateCopy.test.ts`, `githubRelease.test.ts`, `runAppUpdates.test.ts` |
| Wiring | `electron/src/menu/` Check for Updates → `checkForProductUpdate(true)` |
Do not copy `examples/` over the app.

## Tests

- Automated: yes — `electron` `test:unit` (`productUpdate`, `productUpdateCopy`, `githubRelease`, `runAppUpdates`)

## Fallback validation

- Why tests are not feasible: N/A (automated tests exist)
- Command: `python3 scripts/agent-run.py watch-agent-gates --once --autofix`

## Definition of Done

See `docs/FEATURE_MODULES.md` per-feature checklist. Fallback validation: `python3 scripts/agent-run.py watch-agent-gates --once --autofix`.

## Notes

- `release_repo` `OWNER/REPO` is a no-op. Child init writes the real repo.
- Desktop asset: `{Prefix}-X.Y.Z-x64-setup.exe`. Android: `{prefix}-X.Y.Z-foss.apk`.
- After each AGENT step: `bash scripts/watch-agent-gates.sh --once --autofix`
