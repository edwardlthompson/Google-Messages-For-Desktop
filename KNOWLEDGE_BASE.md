# Knowledge Base — Google Messages for Desktop

## KB-001 — Product shape

This repo has **no first-party app source**. Desktop apps are produced by `npx nativefier` via `package.json` scripts. Treat Nativefier flags and the tracked logo as the product surface.

**Fork provenance:** GitHub repo is `edwardlthompson/Google-Messages-For-Desktop`. Upstream product origin remains `kelyvin/Google-Messages-For-Desktop`. `package.json` `repository` / `bugs` / `homepage` point at this fork; keep Kelvin Nguyen as `author` for attribution.

## KB-002 — Yarn lockfile + npm scripts

`yarn.lock` is authoritative. README and scripts use `npm run …`. Do not add `package-lock.json` without HUMAN approval. Dependabot `npm` ecosystem on `/` still applies.

## KB-003 — Default branch is master

All GitHub Actions must trigger on `master`. Do not rename to `main` without HUMAN approval.

## KB-004 — No examples vendor

Template Golden Paths under `examples/**` are intentionally absent. Node module docs describe **root** Nativefier packaging, not Hono.

## KB-005 — Maintenance mode

README states no new features. Alignment work must not revive product features or replace Nativefier with a custom Electron app.

## KB-006 — Windows notifications quirk

Historical Electron/Windows issue: `app.setAppUserModelId(process.execPath)` inside generated Nativefier `resources/app/lib/main.js`. See product `README.md`.

## KB-007 — Local compute only

Do not use Cursor Cloud Agents for this repository. Prefer local parallel Task/worktrees; `BOOTSTRAP_CHECK_JOBS=2` tip on Windows.

## KB-008 — validate-bootstrap vs product CI

`scripts/validate-bootstrap.sh` gates agent/template hygiene. It does **not** build Nativefier desktop binaries — by design (H5).
