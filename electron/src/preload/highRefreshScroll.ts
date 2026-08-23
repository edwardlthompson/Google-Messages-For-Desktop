/** Mark Messages scroll surfaces so adaptive panels can ramp during flings. */

export const HIGH_REFRESH_ATTR = "data-gmfd-high-refresh";
export const HIGH_REFRESH_CLASS = "gmfd-high-refresh-scroll";
export const HIGH_REFRESH_STYLE_ID = "gmfd-high-refresh-scroll-style";
export const PREFERRED_REFRESH_CSS_VAR = "--gmfd-refresh-hz";

export const SCROLL_SURFACE_SELECTORS = [
  "[data-e2e-conversation-list]",
  "mw-conversation-list",
  "mws-conversations-list",
  "mws-messages-list",
  "mw-message-list",
  "mws-message-wrapper",
  '[role="log"]',
] as const;

export const HIGH_REFRESH_SCROLL_CSS = `${SCROLL_SURFACE_SELECTORS.join(
  ",\n"
)},
[${HIGH_REFRESH_ATTR}="1"] {
  will-change: scroll-position;
}
`;

export function overflowAllowsScroll(
  overflow: string | null | undefined
): boolean {
  return overflow === "auto" || overflow === "scroll";
}

export function isScrollSurface(input: {
  overflowX?: string | null;
  overflowY?: string | null;
}): boolean {
  return (
    overflowAllowsScroll(input.overflowY) ||
    overflowAllowsScroll(input.overflowX)
  );
}

export type HighRefreshTarget = {
  getAttribute?: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  classList?: { add: (name: string) => void };
  style?: { willChange?: string };
};

export function applyHighRefreshMark(target: HighRefreshTarget): void {
  if (target.getAttribute?.(HIGH_REFRESH_ATTR) === "1") {
    return;
  }
  target.setAttribute(HIGH_REFRESH_ATTR, "1");
  target.classList?.add(HIGH_REFRESH_CLASS);
  if (target.style != null) {
    const current = target.style.willChange ?? "";
    if (!current.includes("scroll-position")) {
      target.style.willChange = current
        ? `${current}, scroll-position`
        : "scroll-position";
    }
  }
}

export function applyPreferredRefreshHz(
  root: { style?: { setProperty: (name: string, value: string) => void } } | null,
  hz: unknown
): boolean {
  if (root?.style == null || typeof hz !== "number" || !Number.isFinite(hz) || hz <= 0) {
    return false;
  }
  root.style.setProperty(PREFERRED_REFRESH_CSS_VAR, String(Math.round(hz)));
  return true;
}

function markKnownHosts(root: ParentNode): void {
  for (const sel of SCROLL_SURFACE_SELECTORS) {
    root.querySelectorAll(sel).forEach((node) => {
      applyHighRefreshMark(node as HTMLElement);
    });
  }
}

function markComputedScrollers(root: ParentNode, view: Window | null): void {
  if (view == null || typeof view.getComputedStyle !== "function") {
    return;
  }
  const doc = (root as Node).ownerDocument ?? (root as Document);
  const walker = doc.createTreeWalker?.(root as Node, NodeFilter.SHOW_ELEMENT);
  if (walker == null) {
    return;
  }
  let node =
    walker.currentNode.nodeType === 1
      ? (walker.currentNode as Element)
      : (walker.nextNode() as Element | null);
  while (node != null) {
    try {
      if (node.getAttribute(HIGH_REFRESH_ATTR) !== "1") {
        const style = view.getComputedStyle(node);
        if (isScrollSurface({ overflowX: style.overflowX, overflowY: style.overflowY })) {
          applyHighRefreshMark(node as HTMLElement);
        }
      }
    } catch {
      // getComputedStyle can throw on disconnected nodes.
    }
    const shadow = (node as HTMLElement).shadowRoot;
    if (shadow != null) {
      markKnownHosts(shadow);
      markComputedScrollers(shadow, view);
    }
    node = walker.nextNode() as Element | null;
  }
}

export function markHighRefreshScrollSurfaces(
  root: ParentNode | null | undefined
): void {
  if (root == null || typeof root.querySelectorAll !== "function") {
    return;
  }
  markKnownHosts(root);
  const doc = (root as Document).defaultView
    ? (root as Document)
    : ((root as Element).ownerDocument ?? null);
  markComputedScrollers(root, doc?.defaultView ?? null);
}

export function injectHighRefreshScrollCss(doc: Document | null | undefined): void {
  if (doc?.head == null || doc.getElementById(HIGH_REFRESH_STYLE_ID) != null) {
    return;
  }
  const style = doc.createElement("style");
  style.id = HIGH_REFRESH_STYLE_ID;
  style.textContent = HIGH_REFRESH_SCROLL_CSS;
  doc.head.appendChild(style);
}

export function startHighRefreshScrollObserver(): void {
  if (typeof document === "undefined") {
    return;
  }
  injectHighRefreshScrollCss(document);
  let scheduled = 0;
  const scan = () => {
    scheduled = 0;
    markHighRefreshScrollSurfaces(document);
  };
  scan();
  const observer = new MutationObserver(() => {
    if (scheduled !== 0) {
      return;
    }
    scheduled = window.setTimeout(scan, 200);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
