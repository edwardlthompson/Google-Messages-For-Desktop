/** Device-local quiet hours (no Electron imports). */

export const QUIET_HOURS_PRESETS = {
  "22-07": { start: "22:00", end: "07:00", label: "10:00 PM – 7:00 AM" },
  "21-08": { start: "21:00", end: "08:00", label: "9:00 PM – 8:00 AM" },
  "23-06": { start: "23:00", end: "06:00", label: "11:00 PM – 6:00 AM" },
} as const;

export type QuietHoursPreset = keyof typeof QUIET_HOURS_PRESETS;

export function isQuietHoursPreset(value: unknown): value is QuietHoursPreset {
  return typeof value === "string" && value in QUIET_HOURS_PRESETS;
}

export function parseHHmm(value: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** Overnight windows (start > end) wrap midnight. Equal start/end is a no-op. */
export function isInQuietHours(
  now: Date,
  startHHmm: string,
  endHHmm: string
): boolean {
  const start = parseHHmm(startHHmm);
  const end = parseHHmm(endHHmm);
  if (start == null || end == null || start === end) return false;
  const nowM = minutesOfDay(now);
  if (start < end) return nowM >= start && nowM < end;
  return nowM >= start || nowM < end;
}

export function quietHoursActive(
  now: Date,
  enabled: boolean,
  preset: unknown
): boolean {
  if (!enabled || !isQuietHoursPreset(preset)) return false;
  const range = QUIET_HOURS_PRESETS[preset];
  return isInQuietHours(now, range.start, range.end);
}

/** Linux Notification extras; other platforms use Electron defaults. */
export function notificationPlatformOptions(
  platform: string
): { urgency?: "normal" } {
  return platform === "linux" ? { urgency: "normal" } : {};
}
