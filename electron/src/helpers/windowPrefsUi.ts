import { BrowserWindow, screen } from "electron";
import {
  clampZoomFactor,
  DEFAULT_WINDOW_SIZE,
  rememberZoomAtScale,
  zoomForScaleFactor,
} from "./windowPrefs";
import { settings } from "./settings";

function scaleForWindow(win: BrowserWindow): number {
  try {
    return screen.getDisplayMatching(win.getBounds()).scaleFactor || 1;
  } catch {
    return 1;
  }
}

export function bindAlwaysOnTop(win: BrowserWindow): void {
  const apply = (on: boolean): void => {
    if (!win.isDestroyed()) win.setAlwaysOnTop(!!on);
  };
  apply(settings.alwaysOnTopEnabled.value);
  settings.alwaysOnTopEnabled.subscribe(apply);
}

export function bindZoomPersist(win: BrowserWindow): void {
  const apply = (): void => {
    if (win.isDestroyed()) return;
    win.webContents.setZoomFactor(
      zoomForScaleFactor(
        settings.zoomByDisplayScale.value,
        scaleForWindow(win),
        settings.savedZoomFactor.value
      )
    );
  };
  apply();
  win.webContents.on("did-finish-load", apply);
  const persist = (): void => {
    if (win.isDestroyed()) return;
    const z = clampZoomFactor(win.webContents.getZoomFactor());
    settings.savedZoomFactor.next(z);
    settings.zoomByDisplayScale.next(
      rememberZoomAtScale(settings.zoomByDisplayScale.value, scaleForWindow(win), z)
    );
  };
  win.webContents.on("zoom-changed", persist);
  win.on("move", apply);
  screen.on("display-metrics-changed", apply);
}

export function resetWindowSizeAndPosition(win: BrowserWindow): void {
  settings.savedWindowPosition.next(null);
  settings.savedWindowSize.next({ ...DEFAULT_WINDOW_SIZE });
  if (win.isDestroyed()) return;
  win.setSize(DEFAULT_WINDOW_SIZE.width, DEFAULT_WINDOW_SIZE.height);
  win.center();
}
