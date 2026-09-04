# Branding kit

Replaceable product identity for projects bootstrapped from **agent-project-bootstrap**.

## Single sources of truth

| Concern | Edit here | Then run |
|---------|-----------|----------|
| Colors, type, spacing | [`design-tokens/design-tokens.json`](../design-tokens/design-tokens.json) | `python3 scripts/sync-design-tokens.py` |
| Logos / favicon / heroes | [`branding/assets/`](assets/) | `python3 scripts/sync-design-tokens.py` |
| Name, pitch, README copy | [`branding/product.json`](product.json) | `python3 scripts/generate-project-readme.py` |
| Voice guidelines | [`branding/voice.md`](voice.md) | (docs only) |
Official color stylesheet (generated): [`official-colors.css`](official-colors.css).

## Asset inventory

| File | Use |
|------|-----|
| `assets/logo-mark.svg` | App mark; synced to web `icon.svg` / `logo.svg` |
| `assets/logo-mark-mono.svg` | Monochrome / print |
| `assets/logo-wordmark.svg` | Wordmark only |
| `assets/logo-lockup.svg` | Mark + wordmark |
| `assets/favicon.svg` | Browser tab |
| `assets/app-icon-512.svg` | Export to store `icon.png` 512×512 (`[HUMAN]`/`[ADB]`) |
| `assets/readme-hero.svg` | README banner |
| `assets/readme-hero-neon.png` | Local photorealistic README hero (too large for git; splash JPEG is `electron/resources/splash-hero.jpg`) |
| `assets/social-preview.svg` | GitHub / OG 1280×640 (upload PNG export in repo Settings → Social preview) |
## Clear space & contrast

- Keep at least 1/8 of the mark’s width as padding around the mark.
- Prefer mark-on-dark (`#1a1a2e`) or mono mark on light surfaces.
- Check contrast for primary on surface in both light and dark themes after token edits.

## Rebrand checklist

1. Update `meta.name` and colors in `design-tokens/design-tokens.json`.
2. Replace SVGs under `branding/assets/` (keep filenames).
3. Fill `branding/product.json` (set `"mode": "product"` in child repos).
4. Run `python3 scripts/sync-design-tokens.py`.
5. Refresh `branding/generated/README.preview.md` only. **Do not** run `generate-project-readme.py` in a way that overwrites the product `README.md`.
6. Align Help/About copy and GitHub About if the name or tagline changes.
7. Export PNGs for store / social preview when ready — do not commit large binaries unless intentional.

## Template vs product README

- This child repo uses `"mode": "product"` in `branding/product.json` for identity metadata.
- Root `README.md` is the **canonical product README** (Electron / protocols / donate). Do not replace it with the pitch generator.
- `branding/generated/README.preview.md` is a branding-kit preview only.

## Store listing sizes

See [`examples/android/metadata/en-US/images/README.md`](../examples/android/metadata/en-US/images/README.md) for `icon.png` and `featureGraphic.png`. Source art: `app-icon-512.svg` and `social-preview.svg`.
