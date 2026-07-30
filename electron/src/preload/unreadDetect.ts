/** Pure unread / conversation-list detection (DOM Element API only). */

export const CONVERSATION_LIST_SELECTORS = [
  "[data-e2e-conversation-list]",
  "mw-conversation-list",
  "mws-conversations-list",
] as const;

export const UNREAD_SELECTORS = [
  ".unread",
  '[data-e2e-is-unread="true"]',
  '[data-e2e-is-unread=""]',
] as const;

/** Combined selector for docs / MutationObserver attribute filters. */
export const CONVERSATION_LIST_SELECTOR = CONVERSATION_LIST_SELECTORS.join(", ");
export const UNREAD_SELECTOR = UNREAD_SELECTORS.join(", ");

export function findConversationListRoot(
  root: ParentNode | null | undefined
): Element | null {
  if (root == null || typeof root.querySelector !== "function") {
    return null;
  }
  for (const sel of CONVERSATION_LIST_SELECTORS) {
    const found = root.querySelector(sel);
    if (found != null) {
      return found;
    }
  }
  return null;
}

export function isUnreadPresent(root: ParentNode | null | undefined): boolean {
  if (root == null || typeof root.querySelector !== "function") {
    return false;
  }
  for (const sel of UNREAD_SELECTORS) {
    if (root.querySelector(sel) != null) {
      return true;
    }
  }
  return false;
}
