import { ipcRenderer } from "electron";
import {
  RECENT_CONVERSATION_SNIPPET_LENGTH,
  RECENT_CONVERSATION_TRAY_COUNT,
} from "./constants_preload";
import {
  DEFAULT_NOTIFY_BODY,
  DEFAULT_NOTIFY_TITLE,
} from "../helpers/osNotificationLogic";
import {
  findConversationListRoot,
  isUnreadPresent,
} from "./unreadDetect";

let lastUnread = false;
let listRoot: Element | null = null;
let unreadMutationObserver: MutationObserver | null = null;
let recentMutationObserver: MutationObserver | null = null;

function unreadObserver() {
  if (listRoot != null && !listRoot.isConnected) {
    return;
  }
  const unread = isUnreadPresent(listRoot ?? document.body);
  if (!lastUnread && unread) {
    ipcRenderer.send("os-notify", {
      title: DEFAULT_NOTIFY_TITLE,
      body: DEFAULT_NOTIFY_BODY,
    });
  }
  lastUnread = unread;
  ipcRenderer.send("set-unread-status", unread);
}

function detachListObservers() {
  unreadMutationObserver?.disconnect();
  recentMutationObserver?.disconnect();
  unreadMutationObserver = null;
  recentMutationObserver = null;
  listRoot = null;
}

function attachToListRoot(root: Element) {
  detachListObservers();
  listRoot = root;

  unreadMutationObserver = new MutationObserver(unreadObserver);
  unreadMutationObserver.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-e2e-is-unread", "class"],
    childList: true,
  });

  recentMutationObserver = new MutationObserver(recentThreadObserver);
  recentMutationObserver.observe(root, {
    attributes: false,
    subtree: true,
    childList: true,
  });

  unreadObserver();
  recentThreadObserver();
}

/**
 * Ensure conversation-list observers are bound. Re-binds when the SPA remounts
 * the list (previous root disconnected).
 */
export function ensureConversationObservers(): boolean {
  if (listRoot != null && listRoot.isConnected) {
    return true;
  }

  const next = findConversationListRoot(document);
  if (next == null) {
    detachListObservers();
    return false;
  }

  attachToListRoot(next);
  return true;
}

export function createUnreadObserver(): MutationObserver {
  ensureConversationObservers();
  // Return a no-op observer for API compatibility with older call sites.
  return unreadMutationObserver ?? new MutationObserver(() => undefined);
}

export const focusFunctions = new Array(RECENT_CONVERSATION_TRAY_COUNT)
  .fill(0)
  .map(() => () => void 1);

export function recentThreadObserver() {
  const root = listRoot ?? findConversationListRoot(document);
  if (root == null) {
    return;
  }

  const conversations = Array.from(
    root.querySelectorAll("mws-conversation-list-item")
  ).slice(0, RECENT_CONVERSATION_TRAY_COUNT);

  // Fallback: conversation anchors if custom elements renamed
  const items =
    conversations.length > 0
      ? conversations
      : Array.from(root.querySelectorAll('a[href*="/conversations/"]')).slice(
          0,
          RECENT_CONVERSATION_TRAY_COUNT
        );

  const data = items.map((conversation, i) => {
    const name = conversation.querySelector(
      "a div.text-content h2.name span, h2.name span, .name"
    )?.textContent;
    const canvas = conversation.querySelector(
      "a div.avatar-container canvas, canvas"
    ) as HTMLCanvasElement | null;

    const image = canvas?.toDataURL();

    const snippet = conversation
      .querySelector(
        "a div.text-content div.snippet-text mws-conversation-snippet span, mws-conversation-snippet span, .snippet-text"
      )
      ?.textContent?.trim();

    const recentMessage =
      snippet && snippet.length > RECENT_CONVERSATION_SNIPPET_LENGTH
        ? `${snippet.slice(0, RECENT_CONVERSATION_SNIPPET_LENGTH).trimEnd()}…`
        : snippet;

    const focusFunction = () =>
      void (
        conversation.querySelector("a")?.click() ??
        (conversation as HTMLElement).click?.()
      );
    focusFunctions[i] = focusFunction;

    return { name, image, recentMessage, i };
  });
  ipcRenderer.send("set-recent-conversations", data);
}

export function createRecentThreadObserver(): MutationObserver {
  ensureConversationObservers();
  return recentMutationObserver ?? new MutationObserver(() => undefined);
}
