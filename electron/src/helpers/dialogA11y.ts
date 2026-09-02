export function dialogA11yTitle(
  title: unknown,
  message: unknown,
  fallback = "Google Messages"
): string {
  const t = typeof title === "string" ? title.trim() : "";
  if (t) return t;
  const m = typeof message === "string" ? message.trim() : "";
  if (m) return m;
  return fallback;
}
