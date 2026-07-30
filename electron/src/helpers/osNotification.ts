import { Notification, app, ipcMain, nativeImage } from "electron";
import path from "path";
import { IS_MAC, RESOURCES_PATH } from "./constants";
import { getMainWindow } from "./getMainWindow";
import { settings } from "./settings";
import {
  DedupeState,
  NotifyPayload,
  parseOsNotifyIpc,
  sanitizePayload,
  shouldShowToast,
} from "./osNotificationLogic";

let lastToast: DedupeState | null = null;

function notificationIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "64x64.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

function showAndFocusMainWindow(): void {
  const mainWindow = getMainWindow();
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.show();
  mainWindow.focus();
  if (IS_MAC) {
    app.dock?.setBadge("");
  }
}

/**
 * Show a desktop toast when the main window is unfocused.
 * Applies hide-content, sanitize defaults, and 4s dedupe.
 */
export function showMessageNotification(
  rawTitle: unknown,
  rawBody: unknown
): void {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }

  const hideContent = settings.hideNotificationContentEnabled.value;
  const payload: NotifyPayload = sanitizePayload(
    rawTitle,
    rawBody,
    hideContent
  );
  const now = Date.now();
  const { show, next } = shouldShowToast(lastToast, payload, now);
  lastToast = next;
  if (!show) {
    return;
  }

  if (!Notification.isSupported()) {
    console.warn("OS notifications are not supported on this system");
    return;
  }

  const icon = notificationIcon();
  const notification = new Notification({
    title: payload.title,
    body: payload.body,
    ...(icon ? { icon } : {}),
  });
  notification.on("click", () => showAndFocusMainWindow());
  notification.show();
}

/** Register ipcMain listener for preload/bridge `os-notify`. */
export function registerOsNotifyIpc(): void {
  ipcMain.on("os-notify", (_event, payload: unknown) => {
    const parsed = parseOsNotifyIpc(payload);
    if (!parsed) {
      console.warn("Ignoring invalid os-notify payload");
      return;
    }
    showMessageNotification(parsed.title, parsed.body);
  });
}

/** Test-only: reset dedupe state between unit tests that import this module. */
export function _resetOsNotifyDedupeForTests(): void {
  lastToast = null;
}
