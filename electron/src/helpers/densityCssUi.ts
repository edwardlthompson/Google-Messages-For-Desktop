import fs from "fs";
import path from "path";
import { BrowserWindow } from "electron";
import { RESOURCES_PATH } from "./constants";
import { densityCssFilename, parseDensityPreset } from "./densityCss";
import { settings } from "./settings";
import { sanitizeUserCss } from "./userCss";

export function bindDensityCss(win: BrowserWindow): void {
  const inject = (): void => {
    if (win.isDestroyed()) return;
    const file = densityCssFilename(parseDensityPreset(settings.densityPreset.value));
    if (!file) return;
    const dest = path.resolve(RESOURCES_PATH, "density", file);
    let raw = "";
    try {
      raw = fs.readFileSync(dest, "utf8");
    } catch {
      return;
    }
    const css = sanitizeUserCss(raw);
    if (!css) return;
    void win.webContents.insertCSS(css);
  };
  win.webContents.on("did-finish-load", inject);
  settings.densityPreset.subscribe(() => inject());
}
