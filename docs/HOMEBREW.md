# Homebrew Cask

Recipe: `packaging/homebrew/google-messages-for-desktop.rb`.

1. After a GitHub Release, replace `REPLACE_WITH_SHA256` with the SHA-256 of the **universal** DMG (`electron-builder` already targets `arch: ["universal"]`).
2. Confirm the `url` filename matches the Release asset.
3. `[HUMAN]` opens a homebrew-cask PR. This repo does not vendor Homebrew.

Live `sha256` must come from the downloaded file. Never invent a hash.
