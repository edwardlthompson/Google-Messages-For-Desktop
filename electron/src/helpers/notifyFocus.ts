/** Match an OS toast to a tray conversation index (no Electron imports). */

export const GENERIC_TOAST_TITLES = new Set([
  "google messages",
  "new message",
  "new messages",
]);

export type ConversationMatch = {
  name?: string | null;
  i: number;
};

const MAX_TITLE = 200;

export function normalizeToastTitle(title: unknown): string {
  if (typeof title !== "string") return "";
  return title.trim().slice(0, MAX_TITLE);
}

/**
 * Index to send as `focus-conversation`, or null to only raise the window.
 * Hide-content toasts have no sender: use the first listed thread (newest).
 */
export function conversationIndexForToast(
  title: unknown,
  conversations: ConversationMatch[] | null | undefined,
  hideContent: boolean
): number | null {
  if (!Array.isArray(conversations) || conversations.length === 0) {
    return null;
  }
  const first = Number.isInteger(conversations[0]?.i)
    ? conversations[0].i
    : null;
  if (hideContent) {
    return first;
  }
  const needle = normalizeToastTitle(title).toLowerCase();
  if (!needle || GENERIC_TOAST_TITLES.has(needle)) {
    return first;
  }
  for (const row of conversations) {
    const name = (row.name ?? "").trim().toLowerCase();
    if (name && name === needle && Number.isInteger(row.i) && row.i >= 0) {
      return row.i;
    }
  }
  for (const row of conversations) {
    const name = (row.name ?? "").trim().toLowerCase();
    if (
      name &&
      (name.startsWith(needle) || needle.startsWith(name)) &&
      Number.isInteger(row.i) &&
      row.i >= 0
    ) {
      return row.i;
    }
  }
  return null;
}

export function clampConversationIndex(value: unknown, max = 19): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 0 || value > max) return null;
  return value;
}
