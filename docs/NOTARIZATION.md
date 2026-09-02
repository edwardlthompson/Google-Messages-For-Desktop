# macOS notarization (staple / Gatekeeper)

CI macOS artifacts are unsigned unless secrets are set. After `[HUMAN]` signs with a Developer ID:

1. `xcrun notarytool submit App.zip --keychain-profile ... --wait`
2. `xcrun stapler staple App.app` (and the DMG if you ship one)
3. `spctl --assess --verbose App.app` should report accepted
4. Gatekeeper “damaged” usually means the quarantine xattr or a bad staple — `xattr -cr App.app` is a last-resort local test, not a shipping step

Do not skip notarization by telling users to disable Gatekeeper. See `docs/MAC_UNIVERSAL.md`.
