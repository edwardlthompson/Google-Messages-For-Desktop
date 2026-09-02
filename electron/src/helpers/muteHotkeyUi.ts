import { app, BrowserWindow, globalShortcut } from "electron";
import { settings } from "./settings";

export function bindWrapperMuteHotkey(win: BrowserWindow): void {
  const register = (): void => {
    globalShortcut.unregister("CommandOrControl+Shift+M");
    if (!settings.wrapperMuteHotkeyEnabled.value) return;
    globalShortcut.register("CommandOrControl+Shift+M", () => {
      if (win.isDestroyed()) return;
      win.webContents.setAudioMuted(!win.webContents.isAudioMuted());
    });
  };
  register();
  settings.wrapperMuteHotkeyEnabled.subscribe(register);
  app.on("will-quit", () => globalShortcut.unregisterAll());
}
