/** Pure sms/tel/im URL parse helpers (no Electron imports). */

const PROTOCOL_RE = /^(sms|tel|smsto|callto|im|mms):/i;
const MAX_URL = 8192;
const MAX_BODY = 2000;
const BLOCKED = /^(javascript|data|file|vbscript):/i;

function trimUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > MAX_URL) return null;
  if (BLOCKED.test(trimmed)) return null;
  return trimmed;
}

export function parseProtocolBody(url: string): string {
  const trimmed = trimUrl(url);
  if (!trimmed || !PROTOCOL_RE.test(trimmed)) return "";
  try {
    const href = trimmed.replace(PROTOCOL_RE, (_, p) => `${String(p).toLowerCase()}:`);
    const fromQuery = new URL(href).searchParams.get("body");
    if (fromQuery) return fromQuery.slice(0, MAX_BODY);
  } catch {
    /* smsto / malformed */
  }
  if (/^smsto:/i.test(trimmed) && !trimmed.includes("?")) {
    const rest = trimmed.replace(/^smsto:/i, "");
    const idx = rest.indexOf(":");
    if (idx >= 0) {
      try {
        return decodeURIComponent(rest.slice(idx + 1)).slice(0, MAX_BODY);
      } catch {
        return rest.slice(idx + 1).slice(0, MAX_BODY);
      }
    }
  }
  const q = trimmed.split("?")[1];
  if (!q) return "";
  try {
    return (new URLSearchParams(q).get("body") || "").slice(0, MAX_BODY);
  } catch {
    return "";
  }
}

export function normalizeNumber(raw: string): string {
  if (!raw) return "";
  let s = String(raw).trim();
  try {
    if (PROTOCOL_RE.test(s)) {
      const u = new URL(s.replace(PROTOCOL_RE, (_, p) => `${p.toLowerCase()}:`));
      s = u.pathname || u.hostname || "";
      if (s.startsWith("//")) s = s.slice(2);
      if (!s && u.href) {
        s = u.href.replace(PROTOCOL_RE, "").split("?")[0];
      }
    }
  } catch {
    s = s.replace(PROTOCOL_RE, "").split("?")[0];
  }
  s = decodeURIComponent(s).split("?")[0].split("&")[0];
  const hasPlus = s.trim().startsWith("+");
  const digits = s.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Parse a protocol URL. Returns the phone number for compose, or "" for
 * open-only links (e.g. bare `im:` / `im:open` with no digits).
 */
export function parseProtocolUrl(
  url: string | undefined | null
): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = trimUrl(url);
  if (!trimmed || !PROTOCOL_RE.test(trimmed)) return null;
  const number = normalizeNumber(trimmed);
  // Bare IM open links (no phone) still launch/focus the app.
  if (!number && /^im:/i.test(url.trim())) return "";
  return number || null;
}

export function findProtocolArg(argv: string[]): string | null {
  for (const arg of argv) {
    const trimmed = String(arg).trim();
    if (PROTOCOL_RE.test(trimmed) && trimUrl(trimmed)) return trimmed;
  }
  return null;
}
