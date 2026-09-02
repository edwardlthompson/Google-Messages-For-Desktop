/** Apply imported settings.json (no Electron). */

export function isPlainSettingsObject(
  value: unknown
): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function pickKnownSettings(
  incoming: Record<string, unknown>,
  known: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(known)) {
    if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
    const next = incoming[key];
    const prev = known[key];
    if (next == null) continue;
    if (typeof next === typeof prev || (prev === null && typeof next === "object")) {
      out[key] = next;
    }
  }
  return out;
}
