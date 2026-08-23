import { BrowserWindow, ipcMain, screen } from "electron";
import {
  GET_PREFERRED_REFRESH_CHANNEL,
  PREFERRED_REFRESH_CHANNEL,
  preferredWindowRefreshHz,
} from "./displayRefresh";

const APPLY_DEBOUNCE_MS = 80;
const applyTimers = new WeakMap<BrowserWindow, ReturnType<typeof setTimeout>>();
let ipcRegistered = false;

function resolvePreferredHz(win: BrowserWindow): number | null {
  if (win.isDestroyed()) {
    return null;
  }
  try {
    const display = screen.getDisplayMatching(win.getBounds());
    return preferredWindowRefreshHz(display);
  } catch {
    return null;
  }
}

function applyPreferredDisplayMode(win: BrowserWindow): void {
  if (win.isDestroyed() || win.webContents.isDestroyed()) {
    return;
  }
  const hz = resolvePreferredHz(win);
  if (hz == null) {
    return;
  }
  try {
    if (win.webContents.isOffscreen()) {
      win.webContents.setFrameRate(hz);
    }
  } catch {
    // Offscreen-only API; regular windows ignore it.
  }
  try {
    win.webContents.send(PREFERRED_REFRESH_CHANNEL, hz);
  } catch {
    // Sender can race teardown after isDestroyed checks.
  }
}

function scheduleApply(win: BrowserWindow): void {
  const prior = applyTimers.get(win);
  if (prior != null) {
    clearTimeout(prior);
  }
  applyTimers.set(
    win,
    setTimeout(() => {
      applyTimers.delete(win);
      applyPreferredDisplayMode(win);
    }, APPLY_DEBOUNCE_MS)
  );
}

function registerPreferredRefreshIpc(): void {
  if (ipcRegistered) {
    return;
  }
  ipcRegistered = true;
  ipcMain.handle(GET_PREFERRED_REFRESH_CHANNEL, (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win == null || win.isDestroyed()) {
        return null;
      }
      return resolvePreferredHz(win);
    } catch {
      return null;
    }
  });
}

/**
 * Keep the window on the display's fastest same-resolution refresh rate and
 * re-apply when the window moves or the display metrics change.
 */
export function bindPreferredDisplayMode(win: BrowserWindow): void {
  registerPreferredRefreshIpc();
  applyPreferredDisplayMode(win);

  const onChange = () => scheduleApply(win);
  win.on("moved", onChange);
  win.on("resized", onChange);
  win.on("ready-to-show", onChange);
  win.webContents.on("did-finish-load", onChange);
  screen.on("display-metrics-changed", onChange);
  win.on("closed", () => {
    const pending = applyTimers.get(win);
    if (pending != null) {
      clearTimeout(pending);
      applyTimers.delete(win);
    }
    screen.removeListener("display-metrics-changed", onChange);
  });
}
