# News Inbox

Auto-collected inbox of news, upstream updates, security fixes, and ideas relevant to this repo, appended daily by News Bot.
A Cursor planning agent should review these items and fold the useful ones into BUILD_PLAN; entries are append-only, newest at the bottom.


## 2026-11-16

**News and updates**

- Electron 45.3.3 (Nov 14) updates Node.js to 24.22.3 with the Nov 11 security fixes; Electron 41 (pinned here at 41.10.3) has been end-of-life since 2026-08-24, so its Chromium no longer gets security fixes. [source](https://github.com/electron/electron/releases/tag/v45.3.3) · [EOL table](https://releases.electronjs.org/schedule)

**Tasks for the planning agent**

- [x] Upgrade electron 41.10.3 to 45.3.3 — The app renders Google sign-in and Messages web content on an unsupported Chromium; check 42–45 breaking changes, rebuild with electron-builder and smoke-test sign-in, tray and sms:/tel: handlers. Label: `[AGENT]` · Priority: P1 · https://github.com/electron/electron/releases/tag/v45.3.3 (synced to BUILD_PLAN)

## 2026-11-19

**News and updates**

- Electron 45.4.1 (Chromium 156.0.8078.100), 44.11.5 and 43.8.12 ship Chromium/V8/ANGLE/Skia/FFmpeg/PDFium security backports; 44.11.5 (also in 45) fixes non-network Web Worker requests bypassing protocol.handle()/webRequest. Electron 41 (pinned here at 41.10.3) is EOL and gets none of these, so the open 41→45 upgrade should target 45.4.1 or later. [45.4.1](https://github.com/electron/electron/releases/tag/v45.4.1) · [44.11.5](https://github.com/electron/electron/releases/tag/v44.11.5)

**Tasks for the planning agent**

- [x] Upgrade Electron 41.10.3 to 45.4.1 or later (retarget the open 41→45 upgrade; no new board row) — every 45.x security backport widens the gap on EOL 41, and the app loads remote web content from messages.google.com. Label: `[AGENT]` · Priority: P1 · https://github.com/electron/electron/releases/tag/v45.4.1 (synced to BUILD_PLAN)
