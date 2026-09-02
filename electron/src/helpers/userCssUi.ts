import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import { sanitizeUserCss } from "./userCss";
import { settings } from "./settings";

export function userCssPath(): string {
  return path.join(app.getPath("userData"), "user.css");
}

export function bindUserCss(win: BrowserWindow): void {
  const inject = (): void => {
    if (!settings.userCssEnabled.value || win.isDestroyed()) return;
    let raw = "";
    try {
      raw = fs.readFileSync(userCssPath(), "utf8");
    } catch {
      return;
    }
    const css = sanitizeUserCss(raw);
    if (!css) return;
    void win.webContents.insertCSS(css);
  };
  win.webContents.on("did-finish-load", inject);
  settings.userCssEnabled.subscribe(() => {
    if (settings.userCssEnabled.value) inject();
  });
}
