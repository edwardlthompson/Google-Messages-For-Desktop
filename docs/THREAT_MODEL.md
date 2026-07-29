# Threat Model — Google Messages for Desktop

> Windows Chromium App Host + mac/linux Nativefier. No first-party backend. Align security tasks in `BUILD_PLAN.md`.

## Scope

| Item | Value |
|------|-------|
| Project | Google Messages for Desktop |
| Stack | Node tooling; **Windows:** thin host EXE + Chrome/Edge `--app`; **mac/linux:** Nativefier |
| Methodology | STRIDE adapted for a thin desktop web wrapper |

## Trust Boundaries

```text
[User] --> [GoogleMessages.exe host] --> [chrome_proxy / Chrome --app] --> [messages.google.com]
                |                              |
         tray / sms:tel: / named pipe    dedicated Chromium profile + CDP (loopback)
                |
         [Maintainer PC] --> [npm registry / GitHub Actions] (supply chain)
```

- Message content and auth live in Google's web app / Google account — not in this repo's code.
- Windows host registers protocols, tray, and CDP compose; it does **not** embed the SPA in Electron/WebView2.

## STRIDE Summary

| Threat | Example | Mitigation | Owner |
|--------|---------|------------|-------|
| Spoofing | Fake release binary | Publish only from trusted maintainer GitHub Releases; verify download source | HUMAN |
| Tampering | Modified `dist/` build | Rebuild from this repo; do not commit `dist/`; hygiene ignores build outputs | AGENT/HUMAN |
| Repudiation | Unclear release provenance | Conventional Commits + GitHub Release notes | HUMAN |
| Information disclosure | Secrets in agent session / `.env`; CDP cookie scrape | `.env` gitignored; CDP bound to `127.0.0.1` with ephemeral port file; private vuln reporting | AGENT/HUMAN |
| Denial of service | N/A at app scale (Google hosts web) | N/A for wrapper; CI rate/minute awareness for Actions | AUTO |
| Elevation of privilege | Local pipe/CDP abuse; malicious npm dep | Pipe token (`pipe.token`); URL allowlist for open/navigate; Dependabot | AGENT/HUMAN/AUTO |

## Top Abuse Cases

1. Supply-chain compromise via malicious npm dependency (`nativefier` or packaging tools)
2. User downloads unofficial binary from a phishing mirror
3. Secret leakage via accidental commit of `.env` or tokens
4. **Local** process attaches to CDP or spoofs named-pipe commands (same-user malware)
5. Silent UserChoice override via PS-SFTA surprising other tel:/sms: handlers (`GMFD_SKIP_SFTA=1` opt-out)
6. Agent/tooling misconfiguration enabling Cloud Agents against local policy (rejected for this repo)

## Data Handling

- No first-party telemetry in this repository.
- Google Messages Web handles user messages under Google's policies; see `docs/PRIVACY.md`.
- Windows profile: `%LOCALAPPDATA%\GoogleMessages\chromium-profile` (out of band for packaging repo).

## Residual risk

| Risk | Notes |
|------|-------|
| Local CDP / pipe (same user) | Token + ephemeral port reduce drive-by attach; not a cross-user sandbox |
| Upstream Chrome / Nativefier CVEs | Track Dependabot; rebuild releases when critical deps land |
| Web content trust | Fully deferred to `messages.google.com` |
| Old root `engines.node >=12` | Optional bump (HUMAN); host package requires `>=18` |
