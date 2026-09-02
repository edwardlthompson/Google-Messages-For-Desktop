import { Notification, app, ipcMain, nativeImage } from "electron";
import path from "path";
import { IS_MAC, RESOURCES_PATH } from "./constants";
import { getMainWindow } from "./getMainWindow";
import { conversationIndexForToast } from "./notifyFocus";
import {
  DedupeState,
  NotifyPayload,
  parseOsNotifyIpc,
  sanitizePayload,
  shouldShowToast,
  toastGroupTag,
  isToastTitleMuted,
} from "./osNotificationLogic";
import { notificationPlatformOptions, quietHoursActive } from "./quietHours";
import { settings } from "./settings";
import type { Conversation } from "./trayManager";

let lastToast: DedupeState | null = null;
let recentConversations: Conversation[] = [];

export function setNotifyConversations(data: Conversation[]): void {
  recentConversations = Array.isArray(data) ? data : [];
}

function notificationIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "64x64.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

export function showAndFocusMainWindow(): void {
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

export function focusToastConversation(
  title: unknown,
  explicitIndex: number | null = null
): void {
  const hideContent = settings.hideNotificationContentEnabled.value;
  const index =
    explicitIndex ??
    conversationIndexForToast(title, recentConversations, hideContent);
  const mainWindow = getMainWindow();
  if (
    index == null ||
    !mainWindow ||
    mainWindow.isDestroyed()
  ) {
    return;
  }
  mainWindow.webContents.send("focus-conversation", index);
}

/**
 * Show a desktop toast when the main window is unfocused.
 * Native Notification is OS-managed (Focus Assist / DND). Quiet hours skip locally.
 */
export function showMessageNotification(
  rawTitle: unknown,
  rawBody: unknown,
  conversationIndex: number | null = null
): void {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }
  if (
    quietHoursActive(
      new Date(),
      settings.quietHoursEnabled.value,
      settings.quietHoursPreset.value
    )
  ) {
    return;
  }

  const hideContent = settings.hideNotificationContentEnabled.value;
  const payload: NotifyPayload = {
    ...sanitizePayload(rawTitle, rawBody, hideContent),
    conversationIndex,
  };
  const now = Date.now();
  const { show, next } = shouldShowToast(lastToast, payload, now);
  lastToast = next;
  if (!show) {
    return;
  }
  if (isToastTitleMuted(payload.title, settings.mutedToastTitles.value)) {
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
    silent: !settings.notificationSoundEnabled.value,
    tag: toastGroupTag(payload),
    ...notificationPlatformOptions(process.platform),
    ...(icon ? { icon } : {}),
  });
  notification.on("click", () => {
    showAndFocusMainWindow();
    focusToastConversation(payload.title, payload.conversationIndex);
  });
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
    showMessageNotification(
      parsed.title,
      parsed.body,
      parsed.conversationIndex
    );
  });
  ipcMain.on("focus-toast-conversation", (_event, title: unknown) => {
    showAndFocusMainWindow();
    focusToastConversation(typeof title === "string" ? title : "");
  });
}

/** Test-only: reset dedupe state between unit tests that import this module. */
export function _resetOsNotifyDedupeForTests(): void {
  lastToast = null;
}
