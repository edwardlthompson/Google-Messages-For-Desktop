import { BrowserWindow, nativeImage } from "electron";
import path from "path";
import { RESOURCES_PATH } from "./constants";
import {
  SPLASH_BACKGROUND,
  SPLASH_HEIGHT,
  SPLASH_SHOW_FALLBACK_MS,
  SPLASH_WIDTH,
} from "./splash";
import { splashCopy } from "./splashCopy";

function splashIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "256x256.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

export function openLaunchSplash(): BrowserWindow {
  const win = new BrowserWindow({
    width: SPLASH_WIDTH,
    height: SPLASH_HEIGHT,
    show: true,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: SPLASH_BACKGROUND,
    title: splashCopy["splash.heading"],
    icon: splashIcon(),
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  const show = (): void => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  };
  win.once("ready-to-show", show);
  const html = path.resolve(RESOURCES_PATH, "splash.html");
  void win.loadFile(html, {
    query: {
      heading: splashCopy["splash.heading"],
      lede: splashCopy["splash.lede"],
    },
  });
  setTimeout(show, SPLASH_SHOW_FALLBACK_MS);
  return win;
}

export function dismissLaunchSplash(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return;
  win.close();
}
