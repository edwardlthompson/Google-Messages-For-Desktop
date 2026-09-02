/** Camera/mic for Google Calls (no Electron). Picture-in-picture is Chromium's if the page offers it. */

export function isMediaPermission(permission: unknown): boolean {
  return permission === "media" || permission === "mediaKeySystem";
}

export function isDisplayCapturePermission(permission: unknown): boolean {
  return permission === "display-capture";
}

/** Best-effort Calls surface; Messages still uses /web for the SPA. */
export function looksLikeCallsUi(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const href = url.includes("://") ? url : `https://${url}`;
    const parsed = new URL(href);
    const hay = `${parsed.hostname}${parsed.pathname}${parsed.hash}`.toLowerCase();
    if (hay.includes("voice.google.com")) return true;
    if (!hay.includes("messages.google.com")) return false;
    return /call|rtc|webrtc|meet|duo/.test(hay) || hay.includes("/web");
  } catch {
    return false;
  }
}
