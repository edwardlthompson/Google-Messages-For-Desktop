# Windows / macOS / Linux share

Unpackaged Electron cannot register as a Windows **Share** charm / AppX share target (that needs MSIX identity — see BUILD_PLAN row 62). This app’s share path is the OS protocol handlers:

- **Windows:** Settings → Default apps → `sms:` / `smsto:` / `mms:` → Google Messages. Other apps that “share to SMS” open those URLs.
- **macOS:** the same URL schemes in `CFBundleURLTypes` (Services that emit `sms:` work; a custom Services menu is not shipped).
- **Linux:** `.desktop` `MimeType` `x-scheme-handler/sms` (and `tel` / `im` / `mms`) for xdg-open / portal URL shares.

Drag a file onto the Messages window to attach when the web app’s compose surface accepts the drop. Do not navigate to `file://`.
