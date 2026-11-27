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

## 2026-11-25

**News and updates**

- Electron 45.5.0 (Nov 24) updates Chromium to 156.0.8078.109 and also ships 44.11.6 and 43.8.13; there is no 42.x patch in this set. This repo's Nov 22 security bump moved the pin from EOL 41.10.3 to 42.11.18, but Electron 42 itself has been EOL since 2026-10-20, so the open 41→45 upgrade should target 45.5.0 or later. [45.5.0](https://github.com/electron/electron/releases/tag/v45.5.0) · [44.11.6](https://github.com/electron/electron/releases/tag/v44.11.6) · [schedule](https://releases.electronjs.org/schedule)

- Better Stack compared the same desktop chat app built in GPUI (the Rust, GPU-drawn UI framework Discord is moving its desktop app to), Tauri, and Electron, looking at memory, app size, frame rate and CPU. Useful background if this repo is choosing or revisiting a desktop shell; I did not run their comparison. [GPUI](https://gpui.rs) · [Better Stack](https://www.youtube.com/shorts/PbNB0MHO0eA)

**Tasks for the planning agent**

- - [ ] Upgrade Electron 42.11.18 to 45.5.0 or later (retarget the open board row; the Nov 22 bump left the app on an already-EOL 42 line) — the app still loads remote web content from messages.google.com, and only 43–45 received this Chromium backport. Label: `[AGENT]` · Priority: P1 · https://github.com/electron/electron/releases/tag/v45.5.0 (retargeted existing BUILD_PLAN row)

## 2026-11-26

**News and updates**

- Conductor moved its agent-workspace desktop app from Tauri to Electron (0.95.0, Nov 16; numbers posted Nov 24), keeping its Rust local server: workspaces open 71% faster, startup-to-render is 4.6x faster and RAM is 35% lower, while the download grew from about 200 MB to about 500 MB. A real-world counterpoint to "Tauri is always lighter": measure cold start and RAM on the real WebView (WebKitGTK on Linux, WebView2 on Windows) rather than assume. [Conductor 0.95.0](https://www.conductor.build/changelog/0.95.0-agents-that-manage-your-local-workspaces) · [X post](https://x.com/charlieholtz/status/2125351294965805147) News only: a data point for staying on Electron.

## 2026-11-27

**News and updates**

- Correction: the official [Electron schedule](https://releases.electronjs.org/schedule) now lists Electron 46 beta on Dec 3, 2026 and stable on Jan 5, 2027 (yesterday's notes said stable Dec 3); Electron 43 reaches EOL the same day, and 45 is supported until Apr 27, 2027. This repo still locks electron 42.11.18 (EOL since Oct 20); the open P1 board row "Upgrade Electron 42.11.18 to 45.5.0" remains the right fix, so no new task.
