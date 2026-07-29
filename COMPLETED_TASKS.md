# Completed Tasks

## R-Audit-2026-07-29b — Windows App Host /audit (2026-07-29)

- ✅ [AGENT] F-001: Allowlist pipe/`ensureBrowser` URLs to `https://messages.google.com/`
- ✅ [AGENT] F-002: Ephemeral CDP port persisted under dataRoot (drop fixed 19222)
- ✅ [AGENT] F-004: Parse `smsto:`/`callto:` in `compose.js`
- ✅ [AGENT] Pipe token auth for named-pipe commands + tray client
- ✅ [AGENT] F-007: Document SFTA; honor `GMFD_SKIP_SFTA=1` opt-out
- ✅ [AGENT] F-005/F-006/F-008: Sync MODULE/AGENTS/START_HERE/CONTRIBUTING/THREAT_MODEL/THIRD_PARTY + install path
- ✅ [AGENT] F-009/F-010: `.gitignore` smoke artifacts; fix `host/windows/package.json` + tray `PIPE_NAME`
- ✅ [AUTO] `watch-agent-gates --once` + feature-gate / encoding after AGENT fixes

## Sprint W — Windows sms/tel + 1.5.0 packaging (2026-07-29)

- ✅ [AGENT] Inject compose helper + post-Nativefier protocol patch; wire `windows` / `windows:tray`
- ✅ [AGENT] Inno Setup packaging + `release:windows` scripts (Node 20 pin for Nativefier)
- ✅ [AGENT] Bump `1.5.0`, CHANGELOG, README, `docs/WINDOWS_PROTOCOL_HANDLERS.md`
- ✅ [AGENT] Built portable `google-messages-windows-tray_v1.5.0.zip` (patched); Setup EXE awaits local Inno Setup 6

## R-Audit-2026-07-29 (2026-07-29)

- ✅ [AGENT] F-007: Add `CODE_REVIEW.md` (+ `RELEASE_NOTES.md`) to `.gitignore`
- ✅ [AGENT] F-003: Retarget `package.json` repository/bugs/homepage to this fork; note upstream in `KNOWLEDGE_BASE.md`
- ✅ [AGENT] F-004: Rewrite `CONTRIBUTING.md` for this maintenance Nativefier product
- ✅ [AGENT] F-005: Adapt `docs/THREAT_MODEL.md` to Nativefier desktop-wrapper boundaries
- ✅ [AGENT] F-006: Adapt `THIRD_PARTY_LICENSES.md` for root `nativefier` / yarn (no examples)
- ✅ [AUTO] Re-run `validate-bootstrap --quick` + hygiene after AGENT fixes

## Sprint D — Phase 3-4 modules and process (2026-07-29)

- ✅ [AGENT] `modules/node/MODULE.md` adapted for Nativefier (no examples)
- ✅ [AGENT] `COMPLETED_TASKS.md`, `HUMAN_BACKLOG.md`
- ✅ [AGENT] Conventional Commits + session protocol; README agent section
- ✅ [AGENT] Migration notes in `docs/BOOTSTRAP_ALIGNMENT.md`
- ✅ [AGENT] Final validation pass; milestone `AGENT_MEMORY` / `DECISION_LOG` update

## Sprint C — Phase 2 Tooling / CI / security (2026-07-29)

- ✅ [AGENT] Add MIT `LICENSE` (dual copyright)
- ✅ [AGENT] Add `SECURITY.md`, `docs/SECURITY_TRIAGE.md`, threat/privacy stubs
- ✅ [AGENT] Bring `scripts/` gate suite (validate-bootstrap, hygiene, encoding, template-update, agent-run, …)
- ✅ [AGENT] Dependabot + workflows on **`master`**: CI, security, CodeQL (javascript), dependency-review
- ✅ [AGENT] `.pre-commit-config.yaml`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `THIRD_PARTY_LICENSES.md`, PR template
- ✅ [AGENT] Template update checker config (stdout / weekly)
- ✅ [AUTO] Run `validate-bootstrap.sh --quick` (+ hygiene); fix AGENT-fixable failures

## Sprint B — Phase 1 Core agent infrastructure (2026-07-29)

- ✅ [AGENT] Add `AGENTS.md` router (maintenance Nativefier)
- ✅ [AGENT] Add `docs/START_HERE.md`, `CURSOR_MODES.md`, `FOR_AGENTS.md`, adapted `INITIALIZATION_PROMPT.md`
- ✅ [AGENT] Seed `AGENT_MEMORY.md`, `DECISION_LOG.md`, `KNOWLEDGE_BASE.md`
- ✅ [AGENT] Living `BUILD_PLAN.md`
- ✅ [AGENT] Adopt FOSS `.cursor/` rules, commands, hooks, skills, subagents
- ✅ [AGENT] Hygiene files: `.cursorignore`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example`, session-state example
- ✅ [AGENT] `.template-version` `0.15.1` + `.template-update.json`
- ✅ [AGENT] `PROMPT_LIBRARY.md` (from template)

## Sprint A — Phase 0 + section 8 approvals (2026-07-29)

- ✅ [AGENT] Orient repo + write `docs/BOOTSTRAP_ALIGNMENT.md` (v0.15.1 gap analysis)
- ✅ [HUMAN] Venue: This Computer only — no Cloud Agents
- ✅ [HUMAN] Confirm §8 high-risk decisions (accepted 2026-07-29; see DECISION_LOG)
- ✅ [AGENT] Record §8 resolutions into alignment docs
- ✅ [HUMAN] Open branch locally; §8 accepted in Cursor Desktop

## 2026-07-29 — Bootstrap alignment Phase 0–4 bring-up

- Phase 0 gap analysis (`docs/BOOTSTRAP_ALIGNMENT.md`)
- §8 high-risk decisions accepted and recorded
- Sprint B–D surgical bring-up from `agent-project-bootstrap` v0.15.1
