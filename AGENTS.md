# Agent Router — Google Messages for Desktop

1. **First read:** `docs/START_HERE.md`
2. **Cursor modes:** `docs/CURSOR_MODES.md` (Ask / Plan / Agent / Debug routing)
3. **Why / coach:** `docs/BEST_PRACTICES.md` · 30-day playbook `docs/FIRST_30_DAYS.md` · `/coach` · backlog `/ideas` (`docs/help/IDEAS.md`) · first-run `/tour` (`docs/help/TOUR.md` in other IDEs) · portability `docs/AGENT_PORTABILITY.md`
4. **Maintenance / alignment mode:** `docs/INITIALIZATION_PROMPT.md` (do **not** treat this as a fresh bootstrap)
5. **Reference mode:** `docs/FOR_AGENTS.md` + `TEMPLATE_INDEX.json`
6. **Task board:** `BUILD_PLAN.md` (Sequential before Parallel) — status: 🔲 open · ✅ done · ❌ blocked
7. **Parallel dispatch:** prefer local Task/worktrees/`/best-of-n` — see `.cursor/rules/local-compute.mdc`
8. **Living memory:** update `AGENT_MEMORY.md` only at milestone boundaries

> Legacy `.cursorrules` is deprecated. Use `.cursor/rules/*.mdc` and this file instead.

## Product constraints

- **Desktop:** Electron app under `electron/` (Windows / macOS / Linux)
- **Do not** break shared `persist:main` auth modals or reintroduce UA spoofing
- Legacy Chromium App Host (`host/windows`) and Nativefier scripts are rollback-only
- Preserve `package.json` build scripts (`mac` / `windows` / `linux` / `release`)
- Keep root **`yarn.lock`**; Electron deps use `electron/package-lock.json`
- Default branch is **`master`** (not `main`)
- **This Computer only** — no Cursor Cloud Agents / cloud environments for this repo
- FOSS MIT; dual copyright in `LICENSE`; credit OrangeDrangon in README; Venmo donate link in Help/About/README

## Environment & Dependency Management

| Tool | Role |
|------|------|
| Python 3.11+ | Gates, adapters (`scripts/lib/resolve-python.sh`; child also keeps `pick-python.sh`) |
| Git | Required |
| Node 22 + npm | Electron packaging under `electron/` |
Copy `.env.example` → `.env` (never commit `.env`). Manifest: `bootstrap.config.json`.

## Build, Test, and Validation Commands

```bash
python scripts/agent-run.py verify
python scripts/agent-run.py validate-bootstrap --quick
python scripts/agent-run.py feature-gate --stack node
python scripts/agent-run.py watch-agent-gates --once --autofix
python scripts/agent-run.py check-repo-hygiene

```

Do not mark a BUILD_PLAN row complete if verify / feature-gate fails.

## Coding Style

- Conventional Commits for all changes
- Small, modular changes; read-before-write
- Cursor mode routing per `docs/CURSOR_MODES.md`; Plan for non-trivial tasks with resolved `### Critique` (Issue→Resolution baked into the plan body)
- Max 300 lines static data (UI + i18n), 150 lines pure logic

## Session Protocol

- On session start: read `START_HERE.md`, pick mode via `docs/CURSOR_MODES.md`, then `BUILD_PLAN.md` Sequential lane
- On milestone end: update `AGENT_MEMORY.md`, append to `DECISION_LOG.md` or `docs/adr/`
- On 3-strike failure: halt and escalate to human
- On context bloat: write `.cursor-session-state`, ask human to clear chat
- Destructive operations require `[HUMAN]` approval (see `.cursor/rules/destructive-ops.mdc`)
- Repo hygiene: track source only; run `scripts/check-repo-hygiene.sh` before push
- Log significant agent actions in `DECISION_LOG.md` at milestone boundaries

## Module Activation

Active stack: **`node`** (Electron packaging under `electron/`) — see `modules/node/MODULE.md`.
Do **not** vendor `examples/**`.

## Cursor FOSS integrations

- **Hooks** — `.cursor/hooks.json` (fail-open; destructive-ops + UTF-8)
- **Skills** — `.cursor/skills/`
- **Subagents** — `.cursor/agents/` (verifier, gate-fixer, explorer)
- **Local compute first** — `.cursor/rules/local-compute.mdc`
- **Worktrees** — `.cursor/worktrees.json`
- **Auto-review** — `.cursor/permissions.json`
- **Plugin pack** — `.cursor-plugin/plugin.json`
- **Codex review (opt-in)** — `docs/CODEX_REVIEW.md` + `/codex-review` + `.github/workflow-examples/codex-review.yml` (used by expanded `/prerelease` / `/ship`; no live CI job)
- Commercial cloud/Bugbot/Automations stay **hidden** (`distribution_tier: foss`)

Validate: `python scripts/agent-run.py check-cursor-hooks -- --smoke` (or `python3` on Unix)

After editing this file, run `bash scripts/bootstrap-lifecycle.sh --sync-adapters`.
