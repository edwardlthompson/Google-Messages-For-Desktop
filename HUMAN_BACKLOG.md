# Human Backlog

Status: 🔲 open · ✅ done · ❌ blocked

1. 🔲 [HUMAN] Run `npm run build:installer` (Inno 7 detected) to produce Setup EXE; smoke-test install
2. 🔲 [HUMAN] Smoke-test: install or unpack tray build, pair phone, `start sms:+1…` / `start tel:+1…`, Chrome link click
3. 🔲 [HUMAN] Commit/push packaging + bootstrap alignment; open/update PR
4. 🔲 [HUMAN] Tag `v1.5.0` and create GitHub Release with `GoogleMessagesSetup-1.5.0.exe` (after Inno) + `google-messages-windows-tray_v1.5.0.zip`
5. 🔲 [HUMAN] F-001 / R-Audit F-003: Enable Dependabot alerts, **Dependency graph**, and secret scanning (GitHub → Settings → Code security) — Dependency Review CI fails until graph is on
5b. 🔲 [HUMAN] Triage Trivy HIGH/CRITICAL in Nativefier transitive tree (webpack/lodash/minimatch/…) or add accepted `.trivyignore` with rationale — blocks green Security Scan on PR #1
6. 🔲 [HUMAN] Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit
7. 🔲 [HUMAN] Optional: configure branch protection required checks for CI / CodeQL
8. 🔲 [HUMAN] F-008 / R-Audit F-011 optional: bump `engines.node` to modern LTS after packaging smoke
9. 🔲 [HUMAN] Keep deferred workflows deferred unless explicitly requested (Scorecard, Release Please, Pages, stale, weekly-health, automerge PAT)
10. 🔲 [HUMAN] R-Audit-2026-07-29b: Re-pin Messages taskbar icon; confirm identity ≠ Google Chrome
