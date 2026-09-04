/** Google Messages web boot — pure logic (no Electron imports). */

export const MESSAGES_WEB_URL = "https://messages.google.com/web/conversations";
/** Entry URL when no session exists (QR / sign-in). */
export const MESSAGES_WEB_ENTRY_URL = "https://messages.google.com/web/";

export function isMessagesGoogleUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "messages.google.com" || host.endsWith(".messages.google.com");
  } catch {
    return /messages\.google\.com/i.test(url);
  }
}

/** JS executed in the renderer to detect a mounted Messages SPA. */
export const MESSAGES_SPA_PROBE_JS = `(() => ({
  href: location.href,
  hasMw: !!document.querySelector("mw-app, mws-conversations-list"),
  bodyLen: (document.body && document.body.innerHTML || "").length,
}))()`;

export function spaProbeShowsBlank(result: unknown): boolean {
  if (result == null || typeof result !== "object") return true;
  const row = result as { hasMw?: unknown; bodyLen?: unknown; href?: unknown };
  if (row.hasMw === true) return false;
  const href = typeof row.href === "string" ? row.href : "";
  if (!isMessagesGoogleUrl(href)) return true;
  const bodyLen = typeof row.bodyLen === "number" ? row.bodyLen : 0;
  return bodyLen < 500;
}

/** Splash / boot-done gate — require the SPA root, not a large shell HTML alone. */
export function spaProbeShowsReady(result: unknown): boolean {
  if (result == null || typeof result !== "object") return false;
  return (result as { hasMw?: unknown }).hasMw === true;
}

/** Deferred blank checks — never abort an in-flight first loadURL. */
export const MESSAGES_BLANK_RETRY_MS = [5_000, 9_000] as const;

/**
 * Options for Messages `loadURL` — keep Chromium HTTP disk cache on.
 * Do not set `bypassHttpCache` (or any equivalent); static Google assets
 * warm the persist partition. Never cache message bodies ourselves.
 */
export function messagesLoadUrlOptions(): Record<string, never> {
  return {};
}
