# AppLocker / SmartScreen hashes

Record SHA-256 of **released** binaries (never commit live hashes for unsigned local builds).

| Artifact | SHA-256 |
|----------|---------|
| `GoogleMessagesSetup-<ver>.exe` | `REPLACE_WITH_SHA256` |
| portable zip | `REPLACE_WITH_SHA256` |

SmartScreen: new publisher certs warn until reputation builds. AppLocker publisher rules should use the Authenticode cert, not a one-off hash, when `[HUMAN]` signs.

See also `docs/RELEASE_SBOM.md`.
