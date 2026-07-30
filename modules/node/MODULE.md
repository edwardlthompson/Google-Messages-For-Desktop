# Module: Node packaging (Electron multi-platform)

> Activate for this repository’s **root** Node tooling. This is **not** the Hono API Golden Path.

## Product Golden Path

| Platform | UI shell | Build |
|----------|----------|-------|
| **Windows** | Electron (`electron/`) | `npm run windows` / `release:windows` |
| **macOS** | Electron | `npm run mac` / `release:mac` (macOS host or Actions) |
| **Linux** | Electron | `npm run linux` / `release:linux` (Linux host or Actions) |

- Sources: `electron/src/` — deps in `electron/package-lock.json`
- Outputs: `electron/dist/` and repo `dist/` (gitignored)
- CI: [`.github/workflows/release-desktop.yml`](../../.github/workflows/release-desktop.yml)
- Preserve auth pattern: `persist:main` + in-app Google auth modals; no UA spoofing
- Legacy: Chromium App Host (`windows:host`); Nativefier (`mac:nativefier-legacy` / `linux:nativefier-legacy`)

## Requirements

- Root `yarn.lock` (empty OK); Electron `electron/package-lock.json`
- MIT-compatible deps; OrangeDrangon NOTICE under `electron/NOTICE-ORANGEDRANGON.txt`
- Do not vendor template `examples/node/`

## Feature gate

| Stage | Command |
|-------|---------|
| Hygiene | `bash scripts/check-repo-hygiene.sh` |
| Electron Windows package | `npm run release:windows` |
| Electron mac/linux | GitHub Actions or native OS + `bash scripts/desktop/release-electron.sh` |
