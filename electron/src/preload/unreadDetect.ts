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

export function focusConversationList(
  root: ParentNode | null | undefined
): boolean {
  const el = findConversationListRoot(root);
  if (!el) return false;
  (el as HTMLElement).focus?.();
  return true;
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

function isUnreadElement(el: Element): boolean {
  if (el.classList?.contains("unread")) return true;
  const flag = el.getAttribute?.("data-e2e-is-unread");
  return flag === "true" || flag === "";
}

function itemIsUnread(el: Element): boolean {
  if (isUnreadElement(el)) return true;
  if (typeof el.querySelector !== "function") return false;
  for (const sel of UNREAD_SELECTORS) {
    if (el.querySelector(sel) != null) return true;
  }
  return false;
}

const NAME_SELECTOR =
  "a div.text-content h2.name span, h2.name span, .name";

/** First unread thread label for OS toast titles (empty if none). */
export function firstUnreadName(root: ParentNode | null | undefined): string {
  const items = collectUnreadConversationItems(root);
  const name = items[0]?.querySelector?.(NAME_SELECTOR)?.textContent;
  return typeof name === "string" ? name.trim() : "";
}

export function collectUnreadConversationItems(
  root: ParentNode | null | undefined
): Element[] {
  if (root == null || typeof root.querySelectorAll !== "function") {
    return [];
  }
  const nodes = Array.from(
    root.querySelectorAll(
      "mws-conversation-list-item, a[href*='/conversations/']"
    )
  ) as Element[];
  return nodes.filter(itemIsUnread);
}

/** Click each unread row; returns how many were clicked. */
export function markUnreadConversationsRead(
  root: ParentNode | null | undefined,
  click: (el: Element) => void
): number {
  const items = collectUnreadConversationItems(root);
  for (const item of items) {
    const target = item.querySelector?.("a") ?? item;
    click(target);
  }
  return items.length;
}
