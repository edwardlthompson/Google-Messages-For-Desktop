# IT runbook

## Close the app before `package:win`

Windows file locks (`EBUSY`) happen if Google Messages for Desktop is still running. Quit from File / tray, then `npm run package:win` in `electron/`. The packager prints that hint when EBUSY occurs.

## Where logs live

| File | When |
|------|------|
| `settings.json` | Always (preferences) |
| `product-update.json` | Update / Later state |
| `main.log` | Only if Settings → verbose main-process log is on |
| crash notes | Only if Save crash details is on |

All of those sit in the OS user-data folder (Windows: `%APPDATA%\google-messages-for-desktop`). Chat history is in Chromium `persist:main` (or `persist:profile-*` / in-memory `guest`).

Do not copy `persist:*` folders into a ticket.
