# Feature: github-feedback

> Compose GitHub issue-form URLs, clipboard fallback, fail-soft duplicate search. Do not copy `examples/` over the app.

## Acceptance criteria

- ✅ User-visible behavior: small fields prefill `issues/new?title=...`; large bodies use clipboard + short URL
- ✅ Offline/error behavior: placeholder `OWNER/REPO` never hits the network; 403/timeout return `[]`
- ✅ Accessibility: N/A (logic); Open GitHub is `https` only
- ✅ i18n: N/A in this container (copy lives in `feedback.*`)

## Smoke scenario

1. Given `release_repo` `acme/app` and fingerprint `a1b2c3d4e5f6`
2. When the composer builds a crash title
3. Then the title is `[crash] a1b2c3d4e5f6 TypeError` and a second search inside 60s does not fetch again

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/githubFeedback.ts` |
| Tests | `electron/src/helpers/githubFeedback.test.ts` |
| Wiring | `electron/src/helpers/feedbackUi.ts` (Open GitHub) |
## Tests

- Automated: yes — crash title, 60s search cooldown, 403/timeout/placeholder `[]`

## Fallback validation

- Why tests are not feasible: N/A (composer logic is unit-tested)
- Command: `python scripts/agent-run.py feature-gate --stack node`

## Definition of Done

See `docs/FEATURE_MODULES.md`. Fallback: `npm --prefix electron run test:unit`.

## Notes

- Own `isPlaceholderRepo` in this container (do not import About). Default feedback repo is `RELEASE_REPO`
- Share the 60s cooldown with Open GitHub (Search API 10 req/min)
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
