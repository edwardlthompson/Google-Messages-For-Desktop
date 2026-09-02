# Managed policy JSON

Optional overlay for kiosk / GPO images. Missing file means no policy.

Search order:

1. `GMFD_POLICY_FILE` (absolute path)
2. `managed-policy.json` in Electron userData

Example:

```json
{
  "autostart": false,
  "tray": true,
  "updatesOff": true
}
```

Unknown keys are ignored. `updatesOff` disables launch update checks and greys out Help → Check for Updates. This is not Google’s mute; it only affects this wrapper.
