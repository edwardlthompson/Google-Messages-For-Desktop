# AUR

Suggested package name: `google-messages-for-desktop-bin`.

Source the GitHub Release AppImage or `.deb`. Do not vendor Electron in git.

```
pkgname=google-messages-for-desktop-bin
pkgver=1.10.1
pkgrel=1
arch=('x86_64')
license=('MIT')
depends=('gtk3' 'libnotify' 'nss' 'libxss')
source=("https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases/download/v${pkgver}/Google.Messages-v${pkgver}-linux-x64.AppImage")
sha256sums=('REPLACE_WITH_SHA256')
```

After install, users still set Default Apps (`xdg-mime` / GNOME Settings) for `sms:` / `tel:`. See `packaging/linux/postinst.hint`.

`[HUMAN]` publishes to the AUR. Fill `sha256sums` from the downloaded file.
