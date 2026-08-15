# Contributing

Thank you for contributing to **Google Messages for Desktop** — a maintenance-mode desktop wrapper for [Google Messages for Web](https://messages.google.com/web) (Windows / macOS / Linux: Electron under `electron/`).

This fork is maintained at [`edwardlthompson/Google-Messages-For-Desktop`](https://github.com/edwardlthompson/Google-Messages-For-Desktop). Upstream product origin: [`kelyvin/Google-Messages-For-Desktop`](https://github.com/kelyvin/Google-Messages-For-Desktop).

## Who contributes what

| Label | Contributor | Examples |
|-------|-------------|----------|
| `AGENT` | Cursor Agent | Scaffolding, CI config, docs, hygiene, host hardening |
| `HUMAN` | Human developer | Approvals, credentials, GitHub settings, releases |
| `ADB` | — | N/A for this repo |
| `AUTO` | CI/scripts | GitHub Actions, Dependabot, pre-commit |
## Product posture

The project is in **maintenance mode** — no new product features. Welcome contributions that improve packaging reliability, security, documentation, or agent/bootstrap alignment. Do **not** ship the Messages UI inside Electron/WebView2 (Google rejects sign-in) unless a HUMAN decision changes posture.

## Getting started

1. Fork the repository and create a feature branch from `master`.
2. Read `docs/START_HERE.md`, `docs/CURSOR_MODES.md`, `AGENTS.md`, and `CODE_OF_CONDUCT.md`.
3. Report security issues via `SECURITY.md` (private reporting preferred).
4. Prefer Conventional Commits; keep `yarn.lock` (npm CLI OK for `npm run …`).
5. Local gates (when touching agent/CI surface):

```bash
python scripts/agent-run.py validate-bootstrap --quick
python scripts/agent-run.py check-repo-hygiene

```

6. Product rebuilds (local; not run in CI by default):

```bash
npm run windows
npm run mac
npm run linux

```

7. Open a PR using the provided template.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/).

## Pre-commit hooks

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files

```

Includes repo hygiene checks (`scripts/check-repo-hygiene.sh`). See [`docs/REPO_HYGIENE.md`](docs/REPO_HYGIENE.md).

## Security triage

Follow [`docs/SECURITY_TRIAGE.md`](docs/SECURITY_TRIAGE.md) for Dependabot / CodeQL handling.
