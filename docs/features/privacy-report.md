# Feature: privacy-report

> Shared sanitizer, fingerprint, and markdown builder. No network. Electron port plus the existing Python oracle.

## Acceptance criteria

- ✅ User-visible behavior: N/A — pure logic only
- ✅ Offline/error behavior: `null`/empty input becomes `""`; size cap drops excess lines (8 KiB / 200 stack lines)
- ✅ Accessibility: N/A
- ✅ i18n: N/A

## Smoke scenario

1. Given a stack containing `C:\Users\Ada\secret.env`, a `ghp_` token, a JWT, and `AKIA`
2. When `sanitizeReportText` and `buildReportMarkdown` run
3. Then none of those secrets remain and the fingerprint is stable if only the username in a path changes

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/privacyReport.ts`, `privacyReportBuild.ts`; `scripts/lib/privacy_report_*.py` |
| Tests | `electron/src/helpers/privacyReport.test.ts`; `tests/privacy_report/` |
| Wiring | crash persist + feedback copy/open call sanitize before write |
## Tests

- Automated: yes — Electron unit tests plus `tests/privacy_report/`

## Fallback validation

- Why tests are not feasible: N/A
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Definition of Done

See `docs/FEATURE_MODULES.md`. Fallback: `python -m unittest tests.privacy_report.test_sanitize`.

## Notes

- Run sanitize before persist and again before Copy / Open GitHub
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
