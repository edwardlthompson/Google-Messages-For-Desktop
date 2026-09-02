/** Local-only user CSS (never fetch remote). */

export const USER_CSS_MAX = 100_000;
const REMOTE_IMPORT = /@import\s+(?:url\s*\(\s*)?['"]?https?:/i;

export function sanitizeUserCss(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.trim()) return "";
  if (REMOTE_IMPORT.test(text)) return null;
  return text.length > USER_CSS_MAX ? text.slice(0, USER_CSS_MAX) : text;
}
