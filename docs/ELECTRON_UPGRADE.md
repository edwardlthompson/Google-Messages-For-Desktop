# Electron upgrade runbook

Cadence: follow Electron security releases (typically the current stable line used in `electron/package.json`). Do not jump a major without `test:unit` and a local `npm run build:dev`.

1. Read the [Electron release notes](https://www.electronjs.org/docs/latest/breaking-changes) for the target version.
2. In `electron/`: bump `electron` (and `electron-builder` only if required). Run `npm run test:unit`.
3. `python scripts/agent-run.py feature-gate --stack node`
4. Optional: Trivy / `python scripts/agent-run.py update-deps` (dry-run) on `electron/package-lock.json`.
5. Smoke: first-run Defaults panel, protocol compose, OS toast click.
6. Note unsigned Windows overlay/tray until `CSC_LINK` is set.

Do not re-enable `electron-updater` auto-download (Help → Check for Updates uses GitHub installer URLs).
