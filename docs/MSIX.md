# MSIX sideload (FOSS)

This app is **not** an AppX / Store package today. Protocol handlers (`sms:`, `smsto:`, `mms:`) are registered for unpackaged Win32 (see `docs/WINDOWS_SHARE.md`). A real Share Target / Store listing needs an MSIX identity.

## Sideload recipe (no Store SDK)

1. Package the NSIS/portable build as usual (`npm run package:win` in `electron/`).
2. Use Windows SDK `makeappx` / `signtool` on a machine with the SDK — do not add Microsoft Store closed SDKs to this repo.
3. AppxManifest needs `uap:Protocol` for `sms`, `smsto`, `tel`, `mms` and a publisher identity the sideload cert matches.
4. `[HUMAN]` signs with a code-signing cert. CI artifacts stay unsigned unless `CSC_LINK` is set.

Do not enable Microsoft Store partnership APIs or closed telemetry.
