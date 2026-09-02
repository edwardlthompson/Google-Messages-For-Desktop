# Universal macOS binary

`electron/electron-builder.config.js` already packages macOS as **universal** (arm64+x64) DMG and zip:

```
mac.target: dmg + zip with arch: ["universal"]
```

Local: `npm run package:mac` on a Mac (or CI `macos-latest`). Notarization still needs `[HUMAN]` Apple secrets (`APPLE_ID`, `APPLE_TEAM_ID`). Unsigned CI artifacts are smoke-only.
