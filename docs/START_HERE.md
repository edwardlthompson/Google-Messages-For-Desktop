# Start Here — Google Messages for Desktop

> **Read this file first** — whether you are a human or a Cursor agent.

## What is this?

A **maintenance-mode** desktop wrapper for [Google Messages for Web](https://messages.google.com/web): **Windows** uses a Chromium App Host (`GoogleMessages.exe` + Chrome/Edge `--app`); **mac/linux** still use Nativefier. Electron/WebView2 are unsupported for Google sign-in.  
Agent/process infrastructure is aligned with [`agent-project-bootstrap`](https://github.com/edwardlthompson/agent-project-bootstrap) **v0.15.1** (surgical child, not a template init).

## Which mode are you in?

- **Reference / maintenance:** Existing product — read `docs/CURSOR_MODES.md`, then `docs/FOR_AGENTS.md`
- **Alignment work:** Follow `docs/BOOTSTRAP_ALIGNMENT.md` + `BUILD_PLAN.md` Sequential lanes
- **Not a fresh bootstrap:** Do **not** run `scripts/init-project.sh`

## Cursor modes (Plan / Agent / Debug / Ask)

See [`docs/CURSOR_MODES.md`](CURSOR_MODES.md) — pick the Cursor mode before editing.

## Agent shortcuts

Type **`/`** in Cursor Agent chat. Cheat sheet: [`docs/help/BATCH_COMMANDS.md`](help/BATCH_COMMANDS.md).  
Useful: `/verify` before merge, `/gates` for bootstrap checks, `/build` for BUILD_PLAN automation.

## Read order (this repo)

1. `README.md` (product)
2. `docs/START_HERE.md` (this file)
3. `docs/CURSOR_MODES.md`
4. `AGENTS.md`
5. `BUILD_PLAN.md` Sequential lane
6. `modules/node/MODULE.md` (Windows App Host + Nativefier packaging)
6b. `docs/WINDOWS_PROTOCOL_HANDLERS.md` when touching sms/tel or the Windows host
7. `docs/BOOTSTRAP_ALIGNMENT.md` when doing template alignment
8. `docs/FOR_AGENTS.md` + `TEMPLATE_INDEX.json` as reference

## Do Not Read Yet / Do Not Do

- Inactive template `examples/` (not vendored here)
- Cursor Cloud Agents / `.cursor/environment.json` cloud setups
- Rewriting the Messages UI as Electron/WebView2 (login rejected by Google)
- Renaming default branch `master` → `main` without HUMAN approval
- Migrating `yarn.lock` → `package-lock.json` without HUMAN approval

## BUILD_PLAN Labels

`AGENT` | `HUMAN` | `ADB` | `AUTO` — filter with `grep '\[AGENT\]' BUILD_PLAN.md`

**Status markers:** 🔲 open · ✅ done · ❌ blocked — emoji only.

## Product rebuilds

```bash
npm run windows
npm run mac
npm run linux
npm run release
```

Requires Node 12+ (CI uses modern LTS for gates). Lockfile: **Yarn** (`yarn.lock`); npm CLI is fine for scripts.

## Local compute

Prefer **This Computer** + parallel Task/worktrees. On Windows, bootstrap parallel checks default tip: `BOOTSTRAP_CHECK_JOBS=2`.

## Security

Enable Dependabot alerts on GitHub (Settings → Code security). Triage: `docs/SECURITY_TRIAGE.md`. Reporting: `SECURITY.md`.
