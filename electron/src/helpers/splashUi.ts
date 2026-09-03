import { BrowserWindow, nativeImage, nativeTheme } from "electron";
import path from "path";
import { RESOURCES_PATH } from "./constants";
import { settings } from "./settings";
import { parseThemePref, windowBackgroundForTheme } from "./settingsTheme";
import { splashCopy } from "./splashCopy";

function splashBackground(): string {
  return windowBackgroundForTheme(
    parseThemePref(settings.themePreference.value),
    nativeTheme.shouldUseDarkColors,
    nativeTheme.shouldUseHighContrastColors
  );
}

function splashIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "256x256.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

export function openLaunchSplash(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 280,
    show: true,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: splashBackground(),
    title: splashCopy["splash.heading"],
    icon: splashIcon(),
    center: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const html = path.resolve(RESOURCES_PATH, "splash.html");
  void win.loadFile(html, {
    query: {
      heading: splashCopy["splash.heading"],
      lede: splashCopy["splash.lede"],
    },
  });
  return win;
}

export function dismissLaunchSplash(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return;
  win.close();
}
