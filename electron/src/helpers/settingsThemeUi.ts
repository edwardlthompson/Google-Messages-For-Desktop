import { BrowserWindow, nativeTheme } from "electron";
import { settings } from "./settings";
import { parseThemePref, themeSourceForPref, windowBackgroundForTheme } from "./settingsTheme";

export function bindAppTheme(win: BrowserWindow): void {
  const apply = (raw: unknown): void => {
    const pref = parseThemePref(raw);
    nativeTheme.themeSource = themeSourceForPref(pref);
    win.setBackgroundColor(
      windowBackgroundForTheme(
        pref,
        nativeTheme.shouldUseDarkColors,
        nativeTheme.shouldUseHighContrastColors
      )
    );
  };
  apply(settings.themePreference.value);
  settings.themePreference.subscribe(apply);
  nativeTheme.on("updated", () => apply(settings.themePreference.value));
}
