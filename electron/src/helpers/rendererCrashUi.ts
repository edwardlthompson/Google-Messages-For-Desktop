import { BrowserWindow, dialog } from "electron";
import {
  RENDERER_CRASH_MESSAGE,
  rendererCrashShouldReload,
} from "./rendererCrash";

export function bindRendererCrashReload(win: BrowserWindow): void {
  win.webContents.on("render-process-gone", (_event, details) => {
    if (!rendererCrashShouldReload(details.reason)) return;
    if (win.isDestroyed()) return;
    dialog.showMessageBoxSync(win, {
      type: "warning",
      buttons: ["Reload"],
      defaultId: 0,
      title: "Google Messages",
      message: RENDERER_CRASH_MESSAGE,
    });
    if (!win.isDestroyed()) win.webContents.reload();
  });
}
