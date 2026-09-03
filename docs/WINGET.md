# Winget publish runbook (this app)

Package identity for [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs):

| Field | Value |
|-------|--------|
| PackageIdentifier | `EdwardLThompson.GoogleMessages` |
| Publisher | edwardlthompson |
| Installer | GitHub Release NSIS `Google Messages-v*-win-x64.exe` |
| License | MIT |
## Generate / refresh the stub

```bash
bash scripts/generate-winget-manifest.sh EdwardLThompson.GoogleMessages 1.10.1 packaging/winget

```

Then edit `packaging/winget/manifest.stub.yaml`:

1. Set `InstallerUrl` to the HTTPS GitHub Release asset (no tokens).
2. Set `InstallerSha256` to the SHA-256 of that file. Never invent a hash.
3. Run `bash scripts/validate-winget-stub.sh packaging/winget/manifest.stub.yaml`.

`[HUMAN]` opens the winget-pkgs PR. Agents only draft YAML.

Do not commit live installer URLs that embed tokens. Do not commit `.env`.
