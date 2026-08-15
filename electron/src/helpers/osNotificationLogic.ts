/** Pure helpers for OS toast sanitize / dedupe (no Electron imports). */

export const DEFAULT_NOTIFY_TITLE = "Google Messages";
export const DEFAULT_NOTIFY_BODY = "New message";
export const HIDDEN_NOTIFY_TITLE = "New Message";
export const HIDDEN_NOTIFY_BODY = "Click to open";
export const DEDUPE_WINDOW_MS = 4000;

export type NotifyPayload = {
  title: string;
  body: string;
};

export type DedupeState = {
  key: string;
  at: number;
};

function normalizeField(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Coerce title/body to non-empty strings. When hideContent is true, force
 * privacy-safe copy (never pass sender/snippet).
 */
export function sanitizePayload(
  title: unknown,
  body: unknown,
  hideContent: boolean
): NotifyPayload {
  if (hideContent) {
    return { title: HIDDEN_NOTIFY_TITLE, body: HIDDEN_NOTIFY_BODY };
  }
  return {
    title: normalizeField(title, DEFAULT_NOTIFY_TITLE),
    body: normalizeField(body, DEFAULT_NOTIFY_BODY),
  };
}

export function dedupeKey(payload: NotifyPayload): string {
  return `${payload.title}\0${payload.body}`;
}

/**
 * Returns true when this toast should be shown (not a duplicate within window).
 * Mutates `state` when the toast is allowed.
 */
export function shouldShowToast(
  state: DedupeState | null,
  payload: NotifyPayload,
  nowMs: number,
  windowMs: number = DEDUPE_WINDOW_MS
): { show: boolean; next: DedupeState } {
  const key = dedupeKey(payload);
  if (state && state.key === key && nowMs - state.at < windowMs) {
    return { show: false, next: state };
  }
  return { show: true, next: { key, at: nowMs } };
}

/**
 * Accept only plain objects; coerce title/body. Returns null for hostile payloads.
 */
export function parseOsNotifyIpc(payload: unknown): NotifyPayload | null {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const record = payload as Record<string, unknown>;
  return {
    title: typeof record.title === "string" ? record.title : "",
    body: typeof record.body === "string" ? record.body : "",
  };
}

/** Host allowlist for notification permission (messages.google.com only). */
export function isMessagesGoogleHost(urlOrHost: string): boolean {
  try {
    const host = urlOrHost.includes("://")
      ? new URL(urlOrHost).hostname.toLowerCase()
      : urlOrHost.toLowerCase();
    return (
      host === "messages.google.com" || host.endsWith(".messages.google.com")
    );
  } catch {
    return false;
  }
}

/** Permissions Messages web may request on persist:main. Unknown names denied. */
export const ALLOWED_SESSION_PERMISSIONS = new Set([
  "notifications",
  "clipboard-read",
  "clipboard-sanitized-write",
  "fullscreen",
  "media",
  "mediaKeySystem",
]);

/** Grant only allowlisted perms from messages.google.com (deny empty/unknown). */
export function allowSessionPermission(
  permission: string,
  requestingOriginOrUrl: string
): boolean {
  if (
    typeof permission !== "string" ||
    !ALLOWED_SESSION_PERMISSIONS.has(permission)
  ) {
    return false;
  }
  return isMessagesGoogleHost(requestingOriginOrUrl || "");
}
