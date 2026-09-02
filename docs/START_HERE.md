# Start Here — Google Messages for Desktop

> **Read this file first** — whether you are a human or a Cursor agent.

## What is this?

A desktop wrapper for [Google Messages for Web](https://messages.google.com/web): **Windows, macOS, and Linux** use the Electron app under [`electron/`](../electron/) (shell based on OrangeDrangon/android-messages-desktop) with `sms:`/`tel:`/`im:` protocol compose.
Agent/process infrastructure is aligned with [`agent-project-bootstrap`](https://github.com/edwardlthompson/agent-project-bootstrap) **v1.0.0**.

## Read order

1. `README.md`
2. `docs/START_HERE.md` (this file)
3. `AGENTS.md`
4. `modules/node/MODULE.md`
5. `docs/WINDOWS_PROTOCOL_HANDLERS.md` for protocol / first-run details

## Do Not Do

- Break `persist:main` auth modals or reintroduce UA spoofing
- Compose during Stage A onboarding sample probes (association-only)
- Require a local Mac to *prepare* packaging — use Actions for mac/linux binaries

## Product notes

- First-run: Defaults → Sign in → optional Verify
- Donate: quiet **Donate via Venmo** in Help / About (no launch nag)
- Shipping: electron-builder; CI workflow `release-desktop.yml`

## Agent labels

See [`docs/help/GLOSSARY.md`](help/GLOSSARY.md): [**Sacred**](help/GLOSSARY.md#sacred) · [**Canon**](help/GLOSSARY.md#canon) · [**AGENT**](help/GLOSSARY.md#agent) · [**HUMAN**](help/GLOSSARY.md#human) · [**ADB**](help/GLOSSARY.md#adb) · [**AUTO**](help/GLOSSARY.md#auto).
