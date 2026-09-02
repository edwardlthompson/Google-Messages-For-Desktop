import { BrowserWindow, ipcMain } from "electron";
import { clampFindQuery } from "./findInPage";

export function openFindInPage(win: BrowserWindow): void {
  if (!win.isDestroyed()) win.webContents.send("open-find-bar");
}

export function registerFindInPageIpc(): void {
  ipcMain.on("find-in-page", (event, query: unknown, opts: unknown) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return;
    const q = clampFindQuery(query);
    if (!q) {
      win.webContents.stopFindInPage("clearSelection");
      return;
    }
    const forward =
      opts != null &&
      typeof opts === "object" &&
      (opts as { forward?: unknown }).forward === false
        ? false
        : true;
    win.webContents.findInPage(q, { forward, findNext: true });
  });
  ipcMain.on("stop-find-in-page", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.webContents.stopFindInPage("clearSelection");
    }
  });
}

export function bindFoundInPage(win: BrowserWindow): void {
  win.webContents.on("found-in-page", (_event, result) => {
    if (!win.isDestroyed()) win.webContents.send("found-in-page", result);
  });
}
