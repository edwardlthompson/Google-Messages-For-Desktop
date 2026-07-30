# Electron app (Google Messages For Desktop)

Electron shell derived from [OrangeDrangon/android-messages-desktop](https://github.com/OrangeDrangon/android-messages-desktop) (MIT). See [NOTICE-ORANGEDRANGON.txt](NOTICE-ORANGEDRANGON.txt).

**Differentiator:** `sms:` / `tel:` / `smsto:` / `callto:` / `im:` handlers + first-run defaults checklist.

## Dev

```powershell
cd electron
npm install
npm run dev
```

## Package

```powershell
npm run package:win     # Windows
npm run package:mac     # macOS host
npm run package:linux   # Linux host
```

Repo root: `npm run release:windows` / `release:mac` / `release:linux`.

## Auth pattern (do not break)

- `partition: "persist:main"`
- `setWindowOpenHandler` allows Google auth URLs as modal windows on the same partition
- Do **not** reintroduce user-agent spoofing

## First-run

1. Defaults (association-only sample links; compose suppressed)
2. Sign-in guidance panel
3. Optional verify SMS link after signed in
