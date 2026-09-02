export type ThemePref = "system" | "light" | "dark";

export function parseThemePref(raw: unknown): ThemePref {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

/** Maps Settings appearance to Chromium `prefers-color-scheme` (no page CSS). */
export function themeSourceForPref(pref: ThemePref): ThemePref {
  return pref;
}

export function windowBackgroundForTheme(
  pref: ThemePref,
  systemDark: boolean,
  highContrast = false
): string {
  if (highContrast) return systemDark ? "#000000" : "#ffffff";
  const dark = pref === "dark" || (pref === "system" && systemDark);
  return dark ? "#1f1f1f" : "#ffffff";
}
