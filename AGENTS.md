# Agent Router — Google Messages for Desktop

1. **First read:** `docs/START_HERE.md`
2. **Cursor modes:** `docs/CURSOR_MODES.md` (Ask / Plan / Agent / Debug routing)
3. **Maintenance / alignment mode:** `docs/INITIALIZATION_PROMPT.md` (do **not** treat this as a fresh bootstrap)
4. **Reference mode:** `docs/FOR_AGENTS.md` + `TEMPLATE_INDEX.json`
5. **Task board:** `BUILD_PLAN.md` (Sequential before Parallel) — status: 🔲 open · ✅ done · ❌ blocked
6. **Parallel dispatch:** prefer local Task/worktrees/`/best-of-n` — see `.cursor/rules/local-compute.mdc`
7. **Living memory:** update `AGENT_MEMORY.md` only at milestone boundaries

> Legacy `.cursorrules` is deprecated. Use `.cursor/rules/*.mdc` and this file instead.

## Product constraints

- **Maintenance mode** — no new product features; packaging/security/agent-infra only
- **Windows:** Chromium App Host (`host/windows`) + Chrome/Edge `--app` — **not** Electron/WebView2 (Google blocks login)
- **mac/linux:** Nativefier wrapper for `https://messages.google.com/web`
- Preserve `package.json` build scripts (`mac` / `windows` / `linux` / `release`)
- Keep **`yarn.lock`**; npm CLI (`npm run …`) remains OK
- Default branch is **`master`** (not `main`)
- **This Computer only** — no Cursor Cloud Agents / cloud environments for this repo
- FOSS MIT; dual copyright (Kelvin Nguyen + Edward L. Thompson) in `LICENSE`

## Coding Style

- Conventional Commits for all changes
- Small, modular changes; read-before-write
- Cursor mode routing per `docs/CURSOR_MODES.md`; Plan for non-trivial tasks with `### Critique`

## Session Protocol

- On session start: read `START_HERE.md`, pick mode via `docs/CURSOR_MODES.md`, then `BUILD_PLAN.md` Sequential lane
- On milestone end: update `AGENT_MEMORY.md`, append to `DECISION_LOG.md` or `docs/adr/`
- On 3-strike failure: halt and escalate to human
- On context bloat: write `.cursor-session-state`, ask human to clear chat
- Destructive operations require `[HUMAN]` approval (see `.cursor/rules/destructive-ops.mdc`)
- Repo hygiene: track source only; run `scripts/check-repo-hygiene.sh` before push
- Log significant agent actions in `DECISION_LOG.md` at milestone boundaries

## Module Activation

Active stack: **`node`** (Nativefier packaging) — see `modules/node/MODULE.md`.  
Do **not** vendor `examples/**`.

## Cursor FOSS integrations

- **Hooks** — `.cursor/hooks.json` (fail-open; destructive-ops + UTF-8)
- **Skills** — `.cursor/skills/`
- **Subagents** — `.cursor/agents/` (verifier, gate-fixer, explorer)
- **Local compute first** — `.cursor/rules/local-compute.mdc`
- **Worktrees** — `.cursor/worktrees.json`
- **Auto-review** — `.cursor/permissions.json`
- **Plugin pack** — `.cursor-plugin/plugin.json`
- Commercial cloud/Bugbot/Automations stay **hidden** (`distribution_tier: foss`)

Validate: `python scripts/agent-run.py check-cursor-hooks -- --smoke` (or `python3` on Unix)
