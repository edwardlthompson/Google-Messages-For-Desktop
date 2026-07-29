# Module: Node packaging (Windows App Host + Nativefier)

> Activate for this repository’s **root** Node tooling. This is **not** the Hono API Golden Path.

## Product Golden Path

| Platform | UI shell | Build |
|----------|----------|-------|
| **Windows** | Chromium App Host (`host/windows`) + Chrome/Edge `--app` / `chrome_proxy` | `npm run windows` / `windows:host` → `scripts/windows/build-host.ps1` |
| **macOS / Linux** | Nativefier | `npm run mac` / `linux` |

- Icon input: `google-messages-logo.png` (tracked; required)
- Outputs under `dist/` (gitignored)
- Lockfile: **`yarn.lock`** (do not migrate to `package-lock.json` without HUMAN approval)
- npm CLI remains supported for `npm run mac|windows|linux|release`
- **Do not** rewrite the Messages UI as Electron/WebView2 — Google blocks sign-in there

## Requirements (adapted)

- **Dependency locking:** Keep `yarn.lock` committed; install with `yarn` or `npm install` that respects the lockfile
- **License:** MIT-compatible dependencies only; run `scripts/check-license-compliance.sh` before release when available
- **No examples/node:** Do not vendor template `examples/node/`
- **CI:** Do **not** run desktop builds in GitHub Actions by default (heavy, platform-specific). CI = hygiene + validate-bootstrap + CodeQL + dependency-review

## Activation Checklist

- ✅ Root `package.json` with `"license": "MIT"` and `yarn.lock`
- ✅ Dependabot `npm` ecosystem on `/`
- 🔲 HUMAN: Dependabot alerts / secret scanning enabled in GitHub settings
- 🔲 Optional: bump `engines.node` from `>=12` to modern LTS (HUMAN); host package already requires `>=18`

## Feature gate (Sprint 2+)

This product is in **maintenance mode**. Feature gates that assume `examples/node` lint/test **do not apply**. Use:

| Stage | Command |
|-------|---------|
| Hygiene | `bash scripts/check-repo-hygiene.sh` |
| Bootstrap validate | `bash scripts/validate-bootstrap.sh --quick` |
| Windows host rebuild (local) | `npm run windows:host` |
| mac/linux Nativefier (local) | `npm run mac` / `npm run linux` |

## Owner Labels

| Task type | Label |
|-----------|-------|
| Agent infra / docs / CI hygiene / host hardening | `AGENT` |
| LICENSE/branch/lockfile policy changes | `HUMAN` |
| Releases / Installer smoke | `HUMAN` / local `AUTO` |
| validate-bootstrap / hygiene | `AUTO` |
