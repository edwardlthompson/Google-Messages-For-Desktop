# Scoop and Chocolatey

## Scoop

Manifest: `packaging/scoop/google-messages.json`. Replace `REPLACE_WITH_SHA256` from the Windows NSIS exe on GitHub Releases. `[HUMAN]` adds it to a bucket.

## Chocolatey

Do not vendor a `.nuspec` with a fake checksum. After a signed Release, generate:

```
choco new google-messages-for-desktop
```

Point `url` at the same GitHub exe, set `checksum` / `checksumType` from the file, `licenseUrl` to this repo’s MIT `LICENSE`. `[HUMAN]` pushes to chocolatey.org.
