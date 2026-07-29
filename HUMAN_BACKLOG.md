# Human Backlog

Status: 🔲 open · ✅ done · ❌ blocked

1. 🔲 [HUMAN] Run `npm run build:installer` (Inno 7 detected) to produce Setup EXE; smoke-test install
2. 🔲 [HUMAN] Smoke-test: install or unpack tray build, pair phone, `start sms:+1…` / `start tel:+1…`, Chrome link click
3. ✅ [HUMAN] Commit/push packaging + bootstrap alignment (merged PR #1)
4. 🔲 [HUMAN] Upload `GoogleMessagesSetup-1.5.0.exe` + portable zip to Release `v1.5.0` (tag/notes already published)
5. ✅ [HUMAN] Dependabot alerts enabled (via `/ship` API); Critical/High cleared after empty yarn.lock
6. 🔲 [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
7. 🔲 [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
8. 🔲 [HUMAN] F-008 / R-Audit F-011 optional: bump `engines.node` to modern LTS after packaging smoke
9. 🔲 [HUMAN] Keep deferred workflows deferred unless explicitly requested (Scorecard, Release Please, Pages, stale, weekly-health, automerge PAT)
10. 🔲 [HUMAN] Re-pin Messages taskbar icon; confirm identity ≠ Google Chrome
