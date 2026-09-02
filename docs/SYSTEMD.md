# systemd --user autostart (Linux)

Settings → **Start with the operating system** uses Electron `setLoginItemSettings`, which writes an XDG autostart `.desktop` file. That is the default.

If you prefer a systemd user unit instead (no duplicate autostart):

1. Turn **off** Settings → Start with the operating system.
2. Copy `packaging/linux/google-messages.service` to `~/.config/systemd/user/google-messages.service`.
3. Set `ExecStart=` to your installed binary (`/usr/bin/google-messages-for-desktop`, an AppImage path, or a Flatpak `flatpak run` line).
4. `systemctl --user daemon-reload && systemctl --user enable --now google-messages.service`

Do not enable both the desktop autostart file and this unit, or two instances will fight the single-instance lock.
