# MSI wrapper for GPO (FOSS)

This repo ships NSIS (`package:win`) and portable zip — not an MSI. For domain deploy:

1. Build `GoogleMessagesSetup-*.exe` on a clean machine with the app closed (`docs/IT_RUNBOOK.md`).
2. Wrap the Setup EXE with WiX Burn or a vendor MSI tool. Do not add closed Windows Installer SDKs to this repository.
3. GPO: Computer Configuration → Software Installation pointing at the MSI. Protocol handlers still need a per-user first-run Defaults panel or `sms:` association.
4. Optional kiosk: drop `managed-policy.json` (`docs/POLICY.md`) next to userData or set `GMFD_POLICY_FILE`.

`[HUMAN]` signs the MSI. CI stays unsigned unless `CSC_LINK` is set.
