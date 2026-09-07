/**
 * Chromium feature kills for Google Messages web in Electron.
 * Device-bound session credentials cannot complete a pairing token in this
 * shell (same flags as host/windows Chrome --app). Not user-agent spoofing.
 */
export const CHROMIUM_DISABLE_FEATURES = [
  "DeviceBoundSessions",
  "DeviceBoundSessionCredentials",
  "ThirdPartyCookiePhaseout",
  "TrackingProtection3pcd",
].join(",");
