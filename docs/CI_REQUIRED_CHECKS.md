# Required vs informational CI checks

Merge-blocking contexts are listed in [`.github/required-checks.json`](../.github/required-checks.json) and applied by `scripts/setup-github-repo.sh` / branch protection. Local `/gates` is stricter than GitHub required checks (it also runs stack feature-gates and smoke).

This child default branch is **`master`**. Template Golden Path job names (Repo Hygiene, Feature Gate, Template Upgrade Simulation) are not live workflows here.

## Merge-blocking (branch protection)

| Check name | Workflow / job | Notes |
|------------|----------------|-------|
| CI | `ci.yml` (`name: CI`) | Bootstrap hygiene on `master` |
| Security Scan | `security.yml` | Trivy / dependency review path |
| CodeQL | `codeql.yml` | Default + security-extended |

## Informational (do not block merge by default)

| Check / signal | Where | Notes |
|----------------|-------|-------|
| OpenSSF Scorecard | `scorecard.yml` | Weekly / push to `master`; triage via `/triage` |
| SBOM diff (Dependabot) | `sbom-diff-dependabot.yml` | `continue-on-error`; comments only |
| Weekly health | `weekly-health-check.yml` | Monday cron; not merge-blocking |
| Pages deploy | `pages.yml` | Not shipped; Electron installers via `release-desktop.yml` |
| Cursor Approval / Security agents | external checks | Optional commercial; not in required-checks.json |

When adding a new **required** check: update `required-checks.json`, `settings.yml`, and this table in the same PR.

## Windows upgrade-sim flake recipe

Template Upgrade Simulation (Windows) is a parent-template job. This child does not require it. If a fork re-adds it, KB-024 applies (re-run once; two consecutive failures = real regression).
