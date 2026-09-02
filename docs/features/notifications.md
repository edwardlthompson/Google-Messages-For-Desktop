# Feature: notifications

> OS toasts, quiet hours, and click-to-thread. Electron chrome only — do not restyle messages.google.com.

## Acceptance criteria

- ✅ Clicking a toast focuses the matching conversation when the sender is in the recent-thread list (`focus-conversation`); otherwise the window is raised
- ✅ Native `Notification` only (Focus Assist / DND is OS-enforced; no BrowserWindow toast)
- ✅ Quiet hours presets skip toasts and taskbar flash (device-local clock)
- ✅ Notification sound checkbox maps to `Notification({ silent })`
- ✅ New installs default **Hide Notification Content** on
- ✅ Tray **Mark all as read** clicks unread rows when the web app exposes them
- ✅ Hide Content also hides tray avatars
- ✅ Toasts never include a Reply action (this wrapper cannot fill Google compose)
- ✅ Windows toasts use a conversation `tag` so the OS can group/replace them
- ✅ Taskbar overlay badge is the Start-pin identity (`AppUserModelId`)
- ✅ Focused window: visually hidden `aria-live` “New message” (no sender)
- ✅ Wrapper mute of OS toasts by clipboard name (not Google’s in-app mute)
- ✅ i18n: `settings.hide_content`, `settings.notify_sound`, `settings.quiet_hours*`

## Smoke scenario

1. Given an unfocused window and a named recent thread
2. When an OS toast for that sender is clicked
3. Then the main window shows and preload `focus-conversation` runs for that index

## Container map

| Layer | Path |
|-------|------|
| Logic | `electron/src/helpers/notifyFocus.ts`, `quietHours.ts`, `osNotificationLogic.ts` |
| View | Settings menu + tray; OS toast chrome |
| Tests | `notifyFocus.test.ts`, `quietHours.test.ts`, `osNotificationLogic.test.ts`, `nativeNotifyPath.test.ts`, `unreadDetect.test.ts` |
| Wiring | `osNotification.ts`, `observers.ts`, `bridge.ts`, `background.ts` |

## Tests

- Automated: yes — matcher, quiet hours, sanitize, native-path guard, unread click helper

## Fallback validation

- Command: `python scripts/agent-run.py feature-gate --stack node`

## Notes

- HTML5 Notification click (macOS/Linux) sends `focus-toast-conversation` with the toast title
- After each AGENT step: `python scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`
