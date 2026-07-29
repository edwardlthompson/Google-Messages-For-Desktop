# Bootstrap Alignment — Gap Analysis & Plan

> **Phase 0 deliverable** for aligning `edwardlthompson/google-messages-for-desktop` with upstream [`edwardlthompson/agent-project-bootstrap`](https://github.com/edwardlthompson/agent-project-bootstrap) **v0.15.1** (as of 2026-07-25).
>
> Status: **Local handoff** — continue on **This Computer** (Cursor Desktop). Do **not** use Cursor Cloud Agents for this project. Phase 1+ still awaits HUMAN confirmation of §8 high-risk items, but execution should happen locally.
>
> Mode: migration / alignment on a live (maintenance-mode) codebase — not a fresh bootstrap.

---

## 0. Local handoff (do this on your machine)

Cloud Agent work stops here. Pull the branch and finish alignment in **Cursor Desktop** with Agent/Plan modes on **This Computer**.

### Clone / open

```bash
git clone https://github.com/edwardlthompson/Google-Messages-For-Desktop.git
cd Google-Messages-For-Desktop
git fetch origin cursor/bootstrap-alignment-378a
git checkout cursor/bootstrap-alignment-378a
```

Or, if you already have a clone:

```bash
git fetch origin
git checkout cursor/bootstrap-alignment-378a
git pull origin cursor/bootstrap-alignment-378a
```

Open the folder in **Cursor Desktop** (not a Cloud Agent). Draft PR: https://github.com/edwardlthompson/Google-Messages-For-Desktop/pull/1

### Local session protocol (once Phase 1 files exist)

1. Read `docs/START_HERE.md` → `docs/CURSOR_MODES.md` → pick **Plan** or **Agent**
2. Work `BUILD_PLAN.md` **Sequential** first
3. Prefer local parallelism (Task subagents, worktrees, `/best-of-n`) — see template `local-compute.mdc`
4. Do **not** hand tasks to Cloud Agents

### Explicitly out of scope for this repo

| Item | Policy |
|------|--------|
| Cursor Cloud Agents | **Do not use** |
| Commercial cloud hooks / Automations / Bugbot | Keep hidden (`distribution_tier: foss`) |
| `.cursor/environment.json` cloud environments | Do not add for this project |
| Cloud-only MCP / remote compute for gates | Prefer local `scripts/agent-run.py` + local terminals |

### Decision (2026-07-29)

- **Status:** Accepted
- **Context:** Human directed: move project work to the local machine; do not use the cloud.
- **Decision:** All further bootstrap alignment and maintenance agent work runs on Cursor Desktop (This Computer). Cloud Agents are rejected for this repository.
- **Consequences:** Phase 1+ implementation, validation scripts, and Nativefier builds run locally; FOSS `.cursor` integrations only; no commercial cloud activation docs as live config.

---

## 1. Current repository snapshot

| Item | Value |
|------|--------|
| Repo | `edwardlthompson/google-messages-for-desktop` |
| Default branch | `master` |
| Product | Nativefier/Electron wrapper for `https://messages.google.com/web` |
| Declared version | `1.4.2` (`package.json`) |
| License claim | `"license": "MIT"` in `package.json`; **no `LICENSE` file** (GitHub `license: null`) |
| Package manager | **Yarn** (`yarn.lock` present; no `package-lock.json`) |
| Engines | Node `>=12` |
| Runtime app code | None in-repo — build scripts invoke `npx nativefier` |
| Tracked files (HEAD) | 5: `README.md`, `package.json`, `yarn.lock`, `.gitignore`, `google-messages-logo.png` |
| Agent surface | **None** (no `AGENTS.md`, `.cursor/`, docs router, memory files) |
| CI / `.github/` | **None** |
| Security docs | **None** |
| Product posture | README states **maintenance mode** — no new features |

### Tech stack classification

| Dimension | Assessment |
|-----------|------------|
| Primary stack | **Node tooling / desktop packaging** (Nativefier CLI scripts) |
| Not present | Web app source, Python, Android, Rust, Go, Lightroom |
| Closest template module | `modules/node/MODULE.md` (tooling + Dependabot npm) — **not** the Hono API Golden Path |
| Recommended stack selection | `node` with **no** `examples/node/` copy; `distribution_tier: foss` |
| Alternative | `none` — agent/process infra only; still wire npm Dependabot for root `package.json` |

**Decision recommendation:** `.cursor/stack-selection.json` → `"stack": "node"`, do **not** vendor `examples/*`. Document Nativefier packaging as the project Golden Path in `modules/node/MODULE.md` (adapted) or a short project-specific note in `KNOWLEDGE_BASE.md`.

---

## 2. What already matches the template

Very little structural overlap. Preserve as-is:

| Asset | Notes |
|-------|--------|
| MIT intent | Declared in `package.json`; align by adding `LICENSE` (see risks) |
| `.gitignore` | Already ignores `dist/`, `node_modules/`, `.DS_STORE` — merge, do not replace blindly |
| `README.md` | Project-specific product docs — **keep**; add a short “How agents should work” section only |
| `package.json` scripts | Real product build path (`mac` / `windows` / `linux` / `release`) — **do not rewrite** |
| `yarn.lock` | Existing lockfile — preserve unless HUMAN approves npm migration |
| `google-messages-logo.png` | Required Nativefier icon input — keep tracked (hygiene exception; size ~27KB, acceptable) |
| FOSS / MIT-compatible direction | Compatible with template philosophy |

---

## 3. What is missing (relative to v0.15.1)

### Phase 1 — Core agent infrastructure (all missing)

- `AGENTS.md` (router; single source of truth)
- `docs/START_HERE.md`, `docs/CURSOR_MODES.md`, `docs/FOR_AGENTS.md`
- `docs/INITIALIZATION_PROMPT.md` (adapt for maintenance / Nativefier; do not blind-copy bootstrap init)
- `.cursor/rules/*.mdc` (core set: cursor-modes, batch-commands, destructive-ops, local-compute, read-before-write, repo-hygiene, foss-compliance, ci-gates, security-triage, testing, windows-encoding, core-directives; skip or stub design-system / feature-modules if inactive)
- `.cursor/commands/*.md` + `docs/help/BATCH_COMMANDS.md` + `docs/BATCH_COMMANDS.md`
- `.cursor/hooks.json` + hooks, skills, subagents, `permissions.json`, `worktrees.json`, `stack-selection.json`
- `AGENT_MEMORY.md`, `DECISION_LOG.md`, `KNOWLEDGE_BASE.md`
- `BUILD_PLAN.md` with official labels + emoji status markers
- Supporting: `.cursorignore`, `.editorconfig`, `.gitattributes`, expanded `.gitignore`, `.env.example`, `.cursor-session-state.example.json`
- Template tracking: `.template-version`, `.template-update.json`
- `PROMPT_LIBRARY.md` (optional but useful)
- No legacy `.cursorrules` to deprecate (none present)

### Phase 2 — Tooling, scripts, CI, security (all missing)

- `scripts/` validation/hygiene/gates/encoding/template-update/parallel helpers (subset adapted for this stack)
- `.github/workflows/` — no CI today; template has ci, security, CodeQL, dependency-review, scorecard, Dependabot automerge, release-please, stale, weekly-health, pages
- `SECURITY.md`, `docs/SECURITY_TRIAGE.md`, `docs/THREAT_MODEL.md`, `docs/PRIVACY.md`
- `.github/dependabot.yml`, `CODEOWNERS`, PR/issue templates
- `.pre-commit-config.yaml`
- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `THIRD_PARTY_LICENSES.md`, `CHANGELOG.md`

### Phase 3 — Stack modules

- No `modules/` — add adapted `modules/node/MODULE.md` only
- Do **not** copy inactive `examples/`
- Design tokens / i18n / web layout docs: **low priority / stub-only** (no first-party UI source)

### Phase 4 — Process & memory hygiene

- `COMPLETED_TASKS.md`, `HUMAN_BACKLOG.md`
- Conventional Commits expectation (document in CONTRIBUTING / AGENTS)
- Session protocol + README agent section

---

## 4. Conflicts & careful migrations

| Conflict | Current | Template | Migration approach |
|----------|---------|----------|-------------------|
| Default branch | `master` | Workflows target `main` | Adapt workflows to **`master`** (or HUMAN renames branch) — do not force-rename without approval |
| Lockfile | `yarn.lock` | Node module prefers `package-lock.json` + `npm ci` | **Keep Yarn** for product scripts; Dependabot `npm` ecosystem still works on root; document exception in DECISION_LOG |
| Node engine | `>=12` | Modern Node in CI examples | Raise CI Node to LTS (20/22) for gates; leave `engines` unless HUMAN wants bump |
| Product mode | Maintenance / no new features | Sprint 0–N feature playbook | BUILD_PLAN = **alignment sprint + ongoing maintenance**, not feature Golden Path |
| `LICENSE` | Missing | Required by `validate-bootstrap` | Add MIT `LICENSE` with correct copyright (see high-risk) |
| Upstream README / START_HERE | Template-centric | Product README exists | Rewrite START_HERE for **this** repo (Reference + maintenance); keep product README primary for humans |
| CI required checks | None | Many workflows | Add CI conservatively; do not enable branch-protection changes without HUMAN |
| `CODEOWNERS` | N/A | `@edwardlthompson` | Safe default for this org owner; confirm |
| Nativefier binary builds | Local / release scripts | Template CI builds examples | Do **not** run Nativefier desktop builds in CI by default (heavy, platform-specific); CI = hygiene + validate + npm audit/license |
| Template `examples/` | N/A | Large Golden Paths | **Never copy** into this repo |
| Scorecard / Release Please | N/A | Full FOSS template suite | Phase 2 optional; recommend Dependabot + security + CodeQL first; defer Release Please / pages / scorecard until HUMAN opts in |

---

## 5. Recommended stack selection

```json
{
  "distribution_tier": "foss",
  "stack": "node"
}
```

Rationale:

1. Root artifact is Node/`package.json` + packaging scripts.
2. No web/Python/Android application source to activate.
3. Avoids false Golden Path (`examples/node` Hono API) that does not match the product.
4. Allows Dependabot, license checks, and node-oriented gates without pretending this is a full API service.

---

## 6. Risk areas

| Risk | Severity | Notes |
|------|----------|-------|
| Adding/rewriting `LICENSE` copyright line | **High** | Need correct copyright holder(s) (original author Kelvin Nguyen vs current maintainer). HUMAN approval. |
| Default branch rename `master` → `main` | **High** | Destructive / ops impact; leave as `master` unless HUMAN requests rename. |
| Yarn → npm lockfile swap | **High** | Could break contributor workflows; keep `yarn.lock` unless approved. |
| Enabling many GitHub Actions | **Medium** | Actions minutes; adapt triggers to `master`; start with ci + security + CodeQL + dependency-review + Dependabot. |
| Cursor hooks blocking shell | **Medium** | Fail-open design upstream; still adopt with denylist review for Nativefier/`npx` workflows. |
| Blind `init-project.sh` | **High** | Would treat repo as template child and may prune/overwrite — **do not run** full init; surgical copy instead. |
| Overwriting README product content | **High** | Additive section only. |
| Secret / token workflows (automerge PAT) | **Medium** | Skip automerge PAT setup unless HUMAN provides; ship workflows that work without secrets. |
| Tracked logo / future `dist/` | **Low** | Logo OK; ensure `dist/` stays gitignored. |
| Maintenance-mode scope creep | **Medium** | Alignment must not “revive” feature development or replace Nativefier with a new Electron app. |

---

## 7. Prioritized alignment plan (Sequential first)

Use emoji markers only. Labels: `[AGENT]` `[HUMAN]` `[ADB]` `[AUTO]`.

### Sprint A — Phase 0 complete + approvals

#### Sequential

1. ✅ [AGENT] Orient repo + fetch upstream v0.15.1; write this gap analysis
2. ✅ [HUMAN] Venue: continue on local Cursor Desktop — no Cloud Agents (Section 0)
3. 🔲 [HUMAN] Confirm remaining high-risk decisions (Section 8 checklist, except H11)
4. 🔲 [AGENT] **On This Computer:** after confirmation, execute Phase 1 → 2 → 3 → 4 per BUILD_PLAN

#### Parallel

| Task | Owner | Isolated scope |
|------|-------|----------------|
| *None until HUMAN confirms remaining Section 8 items locally* | — | — |

#### Human & device (after automation)

1. 🔲 [HUMAN] Open branch locally (Section 0); approve remaining §8 items in Cursor Desktop
2. 🔲 [HUMAN] Enable Dependabot alerts / secret scanning on GitHub (Settings → Code security) after workflows land

---

### Sprint B — Phase 1 Core agent infrastructure (after confirmation)

#### Sequential

1. 🔲 [AGENT] Add `AGENTS.md` router adapted for this maintenance Nativefier repo
2. 🔲 [AGENT] Add `docs/START_HERE.md`, `CURSOR_MODES.md`, `FOR_AGENTS.md`; adapt `INITIALIZATION_PROMPT.md` (no fresh-bootstrap pretend)
3. 🔲 [AGENT] Seed `AGENT_MEMORY.md`, `DECISION_LOG.md` (append Phase 0 entry), `KNOWLEDGE_BASE.md`
4. 🔲 [AGENT] Create living `BUILD_PLAN.md` (alignment + maintenance lanes)
5. 🔲 [AGENT] Copy/adapt `.cursor/rules/*.mdc`, commands, batch-command docs, hooks/skills/subagents FOSS set
6. 🔲 [AGENT] Add `.cursorignore`, `.editorconfig`, `.gitattributes`, merge `.gitignore`, `.env.example`, session-state example
7. 🔲 [AGENT] Add `.template-version` (`0.15.1`) + `.template-update.json`
8. 🔲 [AGENT] Add `PROMPT_LIBRARY.md` (trimmed) if useful

#### Parallel (after Sequential schema/docs router locked)

| Task | Owner | Isolated scope |
|------|-------|----------------|
| Cursor rules + commands + hooks | AGENT | `.cursor/**` |
| Human-facing agent docs | AGENT | `docs/START_HERE.md`, `docs/CURSOR_MODES.md`, `docs/FOR_AGENTS.md`, `docs/help/**` |
| Memory + BUILD_PLAN seed | AGENT | `AGENT_MEMORY.md`, `DECISION_LOG.md`, `KNOWLEDGE_BASE.md`, `BUILD_PLAN.md` |

#### Human & device (after automation)

1. 🔲 [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit

---

### Sprint C — Phase 2 Tooling / CI / security

#### Sequential

1. 🔲 [AGENT] Add `LICENSE` (MIT) per HUMAN copyright decision
2. 🔲 [AGENT] Add `SECURITY.md`, `docs/SECURITY_TRIAGE.md`, threat/privacy stubs adapted to desktop wrapper
3. 🔲 [AGENT] Bring essential `scripts/` (validate-bootstrap subset, hygiene, encoding, template-update, agent-run, batch-command check) and make them pass for this repo
4. 🔲 [AGENT] Add Dependabot + conservative workflows on **`master`**: CI (hygiene/validate), security scan, CodeQL (javascript), dependency-review
5. 🔲 [AGENT] Add `.pre-commit-config.yaml`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `THIRD_PARTY_LICENSES.md`, PR template
6. 🔲 [AGENT] Wire template update checker conservatively (stdout / weekly)
7. 🔲 [AUTO] Run `validate-bootstrap.sh --quick` (or adapted) + hygiene; fix AGENT-fixable failures

#### Parallel

| Task | Owner | Isolated scope |
|------|-------|----------------|
| Security docs | AGENT | `SECURITY.md`, `docs/SECURITY_TRIAGE.md`, `docs/THREAT_MODEL.md`, `docs/PRIVACY.md` |
| Scripts port | AGENT | `scripts/**` |
| GitHub workflows + Dependabot | AGENT | `.github/**` |

#### Human & device (after automation)

1. 🔲 [HUMAN] Confirm which optional workflows to enable (Scorecard, Release Please, stale, weekly-health, pages)
2. 🔲 [HUMAN] Set CODEOWNERS / branch protection required checks if desired
3. 🔲 [HUMAN] Provide automerge PAT only if Dependabot automerge is wanted

---

### Sprint D — Phase 3–4 modules & process

#### Sequential

1. 🔲 [AGENT] Add `modules/node/MODULE.md` adapted for Nativefier packaging (no examples copy)
2. 🔲 [AGENT] Add `COMPLETED_TASKS.md`, `HUMAN_BACKLOG.md`
3. 🔲 [AGENT] Document Conventional Commits + session protocol; short README “How agents should work”
4. 🔲 [AGENT] Migration notes section (below + README/docs pointer)
5. 🔲 [AGENT] Final validation pass; update `AGENT_MEMORY.md` / `DECISION_LOG.md` at milestone

#### Human & device (after automation)

1. 🔲 [HUMAN] Review Migration notes; clear remaining backlog items

---

## 8. High-risk confirmation checklist (HUMAN)

Please confirm or amend before Phase 1+ execution:

| # | Decision | Proposed default | Confirm? |
|---|----------|------------------|----------|
| H1 | Copyright line for new `LICENSE` | MIT; copyright text TBD by HUMAN (original Kelvin Nguyen + current maintainer?) | ⬜ |
| H2 | Default branch | Keep **`master`**; adapt all workflows | ⬜ |
| H3 | Package manager | Keep **Yarn** / `yarn.lock`; do not migrate to npm | ⬜ |
| H4 | Stack selection | `node` + **no** `examples/` vendor | ⬜ |
| H5 | CI scope (v1) | Hygiene + validate-bootstrap + CodeQL JS + dependency-review + Dependabot; **no** Nativefier build in CI | ⬜ |
| H6 | Optional workflows | Defer Scorecard, Release Please, Pages, stale, weekly-health until asked | ⬜ |
| H7 | Cursor hooks | Adopt FOSS hooks (fail-open) from template; local Desktop only | ✅ assumed (local-first) |
| H8 | Product scope | Alignment tooling only — no feature revival / Electron rewrite | ⬜ |
| H9 | CODEOWNERS | `* @edwardlthompson` | ⬜ |
| H10 | Run `init-project.sh`? | **No** — surgical file bring-up only | ⬜ |
| H11 | Compute venue | **This Computer only** — no Cursor Cloud Agents | ✅ confirmed 2026-07-29 |

---

## 9. Migration notes (draft for humans)

After Phase 1–4 land, agents and humans should:

1. Read `docs/START_HERE.md` → pick Cursor mode → work `BUILD_PLAN.md` Sequential first.
2. Treat `AGENTS.md` as the router; there is no `.cursorrules`.
3. Product rebuilds remain: `npm run mac|windows|linux|release` (Yarn-compatible).
4. Expect Conventional Commits going forward.
5. Manual GitHub settings (Dependabot alerts, branch protection) remain `[HUMAN]`.
6. Template upgrades: `scripts/check-template-updates.sh` + `docs/UPGRADING_FROM_TEMPLATE.md`.

**Still needs manual attention after automation:** items under every “Human & device” section and `HUMAN_BACKLOG.md`.

---

## 10. Out of scope (explicit)

- Rewriting Nativefier scripts into a custom Electron app
- Vendoring template `examples/**`
- Changing default branch without approval
- Force-push / history rewrite
- Enabling paid/commercial Cursor integrations
- **Cursor Cloud Agents / cloud environments for this repo** (local Desktop only)
- F-Droid / Android paths (`[ADB]` N/A)

---

## 11. Upstream reference pin

| Field | Value |
|-------|--------|
| Upstream | `edwardlthompson/agent-project-bootstrap` |
| Version | `0.15.1` (`.template-version`) |
| Reviewed | 2026-07-29 (shallow clone + tree listing) |
| Strategy | Surgical cherry-pick per `docs/UPGRADING_FROM_TEMPLATE.md` areas |

---

*Phase 0 complete. Do not start broad Phase 1+ file changes until Section 8 is confirmed.*
