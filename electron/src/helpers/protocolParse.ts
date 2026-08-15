/** Pure sms/tel/im URL parse helpers (no Electron imports). */

const PROTOCOL_RE = /^(sms|tel|smsto|callto|im):/i;

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
  if (!PROTOCOL_RE.test(url.trim())) return null;
  const number = normalizeNumber(url);
  // Bare IM open links (no phone) still launch/focus the app.
  if (!number && /^im:/i.test(url.trim())) return "";
  return number || null;
}

export function findProtocolArg(argv: string[]): string | null {
  for (const arg of argv) {
    if (PROTOCOL_RE.test(String(arg).trim())) return String(arg).trim();
  }
  return null;
}
