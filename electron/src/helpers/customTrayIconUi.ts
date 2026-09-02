import { dialog, type OpenDialogOptions } from "electron";
import { getMainWindow } from "./getMainWindow";
import { isLocalTrayPng } from "./customTrayIcon";
import { settings } from "./settings";

export async function chooseCustomTrayIcon(): Promise<void> {
  const win = getMainWindow();
  const opts: OpenDialogOptions = {
    title: "Custom tray icon",
    filters: [{ name: "PNG", extensions: ["png"] }],
    properties: ["openFile"],
  };
  const picked = win
    ? await dialog.showOpenDialog(win, opts)
    : await dialog.showOpenDialog(opts);
  const file = picked.filePaths[0];
  if (picked.canceled || !file || !isLocalTrayPng(file)) return;
  settings.customTrayIconPath.next(file);
}

export function clearCustomTrayIcon(): void {
  settings.customTrayIconPath.next("");
}
