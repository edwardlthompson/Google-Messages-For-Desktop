# Threat Model — Google Messages for Desktop

> Windows Electron app + mac/linux Nativefier. No first-party backend. Align security tasks in `BUILD_PLAN.md`.

## Scope

| Item | Value |
|------|-------|
| Project | Google Messages for Desktop |
| Stack | Node tooling; **Windows:** Electron (`electron/`); **mac/linux:** Nativefier |
| Methodology | STRIDE adapted for a thin desktop web wrapper |

## Trust Boundaries

```text
[User] --> [Google Messages Electron] --> [messages.google.com]
                |
         tray / sms:tel: / compose in page
                |
         [Maintainer PC] --> [npm registry / GitHub Actions] (supply chain)
```

- Message content and auth live in Google's web app / Google account — not in this repo's code.
- Electron loads the SPA with a persistent partition; Google auth popups stay in-app on that partition.
- Protocol handlers invoke page compose scripts (not a remote backend).

## STRIDE Summary

| Threat | Example | Mitigation | Owner |
|--------|---------|------------|-------|
| Spoofing | Fake release binary | Publish only from trusted maintainer GitHub Releases; verify download source | HUMAN |
| Tampering | Modified `dist/` build | Rebuild from this repo; do not commit `dist/`; hygiene ignores build outputs | AGENT/HUMAN |
| Repudiation | Unclear release provenance | Conventional Commits + GitHub Release notes | HUMAN |
| Information disclosure | Secrets in agent session / `.env` | `.env` gitignored; private vuln reporting | AGENT/HUMAN |
| Denial of service | N/A at app scale (Google hosts web) | N/A for wrapper; CI rate/minute awareness for Actions | AUTO |
| Elevation of privilege | Malicious local protocol URL / npm dep | Protocol parse + allowlisted Messages navigation; Dependabot | AGENT/HUMAN/AUTO |

## Top Abuse Cases

1. Supply-chain compromise via malicious npm dependency (Electron / electron-builder)
2. User downloads unofficial binary from a phishing mirror
3. Crafted `sms:`/`tel:` URL trying to drive unexpected page script behavior (compose is number-fill only)

## Out of scope

- Google account / Messages for web server security
- Compromised OS-level malware with the user's session already unlocked

## Legacy host note

The Chromium App Host under `host/windows` (CDP on loopback, named pipe) is no longer the shipping path; its threat notes (pipe token, CDP port file) apply only if that host is run for rollback.
