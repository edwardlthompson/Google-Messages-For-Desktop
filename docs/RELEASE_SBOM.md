# Desktop release checksums and SBOM

GitHub Release should attach:

| Asset | Role |
|-------|------|
| Platform installers (exe, dmg, AppImage, deb) | Users |
| `SHA256SUMS` (or per-file hashes in the notes) | Integrity |
| `sbom.cyclonedx.json` | CycloneDX of the packaged tree |
| OpenVEX next to the SBOM | Known CVE statements |

Template attestation for the SBOM file: [`docs/PACKAGE_ATTESTATION.md`](PACKAGE_ATTESTATION.md). Desktop workflow `.github/workflows/release-desktop.yml` currently uploads unsigned binaries; adding the SBOM job is a `[HUMAN]` CI follow-up if `release.yml` is not used for Electron.

Never invent checksums. Compute them from the files that were uploaded.
