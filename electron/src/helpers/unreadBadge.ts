export type UnreadBadgeColor = "red" | "accent";

export function parseUnreadBadgeColor(raw: unknown): UnreadBadgeColor {
  return raw === "accent" ? "accent" : "red";
}

export function unreadTrayFilenamePrefix(
  unread: boolean,
  redDotEnabled: boolean,
  color: UnreadBadgeColor
): string {
  if (!unread || !redDotEnabled) return "";
  if (color === "accent") return "";
  return "unread_";
}
