import { app, BrowserWindow, nativeImage } from "electron";
import path from "path";
import { IS_LINUX, IS_MAC, IS_WINDOWS, RESOURCES_PATH } from "./constants";
import {
  dockBadgeForUnread,
  overlayDescription,
  windowTitleForUnread,
} from "./unreadChrome";

export function applyUnreadWindowChrome(
  win: BrowserWindow | null,
  unread: boolean
): void {
  if (!win || win.isDestroyed()) return;
  win.setTitle(windowTitleForUnread(unread));
  if (IS_MAC) {
    app.dock?.setBadge(dockBadgeForUnread(unread));
  }
  if (IS_WINDOWS) {
    const overlayPath = path.resolve(
      RESOURCES_PATH,
      "tray",
      "unread_icon.png"
    );
    const overlay = nativeImage.createFromPath(overlayPath);
    win.setOverlayIcon(
      unread && !overlay.isEmpty() ? overlay : null,
      overlayDescription(unread)
    );
  }
  if (IS_LINUX) {
    win.setTitle(windowTitleForUnread(unread));
  }
}
