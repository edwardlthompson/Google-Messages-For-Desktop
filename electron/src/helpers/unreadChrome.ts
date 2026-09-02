export const BASE_WINDOW_TITLE = "Google Messages";

export function windowTitleForUnread(unread: boolean): string {
  return unread ? `${BASE_WINDOW_TITLE} (unread)` : BASE_WINDOW_TITLE;
}

export function dockBadgeForUnread(unread: boolean): string {
  return unread ? "•" : "";
}

export function overlayDescription(unread: boolean): string {
  return unread ? "Unread messages" : "";
}

export function trayTooltipForUnread(
  unread: boolean,
  hideContent: boolean,
  lastSender: string | null = null
): string {
  if (!unread) return BASE_WINDOW_TITLE;
  if (hideContent) return `${BASE_WINDOW_TITLE} — unread`;
  const who = lastSender?.trim();
  return who
    ? `${BASE_WINDOW_TITLE} — unread from ${who}`
    : `${BASE_WINDOW_TITLE} — unread`;
}
