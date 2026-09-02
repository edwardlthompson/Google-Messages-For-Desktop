# Linux Wayland smoke

Unsigned AppImage / deb on GNOME or KDE Wayland:

1. Window icon: should match `resources/icons/256x256.png`. If the dock shows a generic icon, confirm `StartupWMClass=Google Messages` in the `.desktop` file matches `BrowserWindow` title.
2. Tray: needs a working StatusNotifier/AppIndicator. If the tray is missing, use Settings → Enable Tray Icon after installing `gnome-shell-extension-appindicator` (or KDE’s tray).
3. Notifications: native Electron `Notification` with `urgency: normal`.
4. If the window is invisible, try `ELECTRON_OZONE_PLATFORM_HINT=auto` or run on XWayland (`GDK_BACKEND=x11`) and file a bug with `echo $XDG_SESSION_TYPE`.

## Fractional scaling smoke

| Scale | What to check |
|-------|----------------|
| 100% | Window chrome sharp; tray icon not blurry |
| 125% | First-run buttons still ≥44px; zoom restore matches this scale |
| 150% | Jump List still readable; no clipped tray |
| 200% | Overlay unread badge on the taskbar/dock still visible |

This is a smoke checklist, not an automated gate.

This is a smoke checklist, not an automated gate.
