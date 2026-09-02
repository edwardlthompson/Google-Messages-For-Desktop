/** Zoom clamp / persist helpers (no Electron imports). */

export const DEFAULT_WINDOW_SIZE = { width: 1100, height: 800 };
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const DEFAULT_ZOOM = 1;

export function clampZoomFactor(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, n));
}

export function scaleKey(scale: unknown): string {
  const n = typeof scale === "number" ? scale : Number(scale);
  if (!Number.isFinite(n) || n <= 0) return "1";
  return String(Math.round(n * 100) / 100);
}

export function parseZoomByDisplayScale(raw: unknown): Record<string, number> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d+(\.\d+)?$/.test(key)) continue;
    out[key] = clampZoomFactor(val);
  }
  return out;
}

export function zoomForScaleFactor(
  map: unknown,
  scale: unknown,
  fallback: unknown
): number {
  const rec = parseZoomByDisplayScale(map);
  const key = scaleKey(scale);
  if (Object.prototype.hasOwnProperty.call(rec, key)) return rec[key];
  return clampZoomFactor(fallback);
}

export function rememberZoomAtScale(
  map: unknown,
  scale: unknown,
  zoom: unknown
): Record<string, number> {
  const rec = parseZoomByDisplayScale(map);
  rec[scaleKey(scale)] = clampZoomFactor(zoom);
  const keys = Object.keys(rec);
  if (keys.length > 12) delete rec[keys[0]];
  return rec;
}
