import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findConversationListRoot,
  firstUnreadName,
  focusConversationList,
  isUnreadPresent,
  markUnreadConversationsRead,
} from "./unreadDetect.ts";

type FakeEl = {
  tag: string;
  attrs: Record<string, string>;
  className: string;
  children: FakeEl[];
  textContent?: string;
  focused?: boolean;
  classList: { contains: (c: string) => boolean };
  getAttribute: (k: string) => string | null;
  querySelector: (sel: string) => FakeEl | null;
  querySelectorAll: (sel: string) => FakeEl[];
  focus?: () => void;
};

function matchesSel(node: FakeEl, sel: string): boolean {
  const part = sel.trim();
  if (part === "mws-conversations-list" || part === "mw-conversation-list") {
    return node.tag === part;
  }
  if (part === "mws-conversation-list-item") {
    return node.tag === part;
  }
  if (part === "[data-e2e-conversation-list]") {
    return Object.prototype.hasOwnProperty.call(
      node.attrs,
      "data-e2e-conversation-list"
    );
  }
  if (part === ".unread") {
    return node.className.split(/\s+/).includes("unread");
  }
  if (part === ".name") {
    return node.className.split(/\s+/).includes("name");
  }
  if (part === "a") {
    return node.tag === "a";
  }
  if (part === '[data-e2e-is-unread="true"]') {
    return node.attrs["data-e2e-is-unread"] === "true";
  }
  if (part === '[data-e2e-is-unread=""]') {
    return node.attrs["data-e2e-is-unread"] === "";
  }
  return false;
}

function matchesCompound(node: FakeEl, sel: string): boolean {
  return sel.split(",").some((part) => matchesSel(node, part));
}

function el(
  tag: string,
  opts: {
    attrs?: Record<string, string>;
    className?: string;
    children?: FakeEl[];
    text?: string;
  } = {}
): FakeEl {
  const self: FakeEl = {
    tag,
    attrs: opts.attrs ?? {},
    className: opts.className ?? "",
    children: opts.children ?? [],
    textContent: opts.text,
    classList: {
      contains: (c: string) => self.className.split(/\s+/).includes(c),
    },
    getAttribute(k: string) {
      return Object.prototype.hasOwnProperty.call(self.attrs, k)
        ? self.attrs[k]
        : null;
    },
    querySelector(sel: string) {
      if (matchesCompound(self, sel)) return self;
      for (const child of self.children) {
        const hit = child.querySelector(sel);
        if (hit) return hit;
      }
      return null;
    },
    focus() {
      self.focused = true;
    },
    querySelectorAll(sel: string) {
      const out: FakeEl[] = [];
      const walk = (n: FakeEl): void => {
        if (matchesCompound(n, sel)) out.push(n);
        n.children.forEach(walk);
      };
      self.children.forEach(walk);
      if (matchesCompound(self, sel)) out.unshift(self);
      return out;
    },
  };
  return self;
}

describe("findConversationListRoot", () => {
  it("returns null for missing root", () => {
    assert.equal(findConversationListRoot(null), null);
  });

  it("finds mws-conversations-list", () => {
    const list = el("mws-conversations-list");
    const doc = el("body", { children: [list] });
    assert.equal(findConversationListRoot(doc as unknown as ParentNode), list);
  });

  it("finds data-e2e-conversation-list", () => {
    const list = el("div", { attrs: { "data-e2e-conversation-list": "" } });
    const doc = el("body", { children: [list] });
    assert.equal(findConversationListRoot(doc as unknown as ParentNode), list);
  });
});

describe("focusConversationList", () => {
  it("focuses the conversation list root", () => {
    const list = el("mws-conversations-list");
    const doc = el("body", { children: [list] });
    assert.equal(focusConversationList(doc as unknown as ParentNode), true);
    assert.equal(list.focused, true);
  });

  it("returns false when no list exists", () => {
    const doc = el("body");
    assert.equal(focusConversationList(doc as unknown as ParentNode), false);
  });
});

describe("isUnreadPresent", () => {
  it("detects .unread", () => {
    const unread = el("div", { className: "unread" });
    const root = el("mws-conversations-list", { children: [unread] });
    assert.equal(isUnreadPresent(root as unknown as ParentNode), true);
  });

  it("detects data-e2e-is-unread", () => {
    const unread = el("span", { attrs: { "data-e2e-is-unread": "true" } });
    const root = el("mw-conversation-list", { children: [unread] });
    assert.equal(isUnreadPresent(root as unknown as ParentNode), true);
  });

  it("returns false when no unread markers", () => {
    const read = el("div", { className: "read" });
    const root = el("mws-conversations-list", { children: [read] });
    assert.equal(isUnreadPresent(root as unknown as ParentNode), false);
  });
});

describe("firstUnreadName / markUnreadConversationsRead", () => {
  it("names and clicks unread list items", () => {
    const name = el("span", { className: "name", text: "Ada" });
    const unread = el("mws-conversation-list-item", {
      className: "unread",
      children: [name],
    });
    const root = el("mws-conversations-list", { children: [unread] });
    assert.equal(firstUnreadName(root as unknown as ParentNode), "Ada");
    const clicked: string[] = [];
    const n = markUnreadConversationsRead(
      root as unknown as ParentNode,
      (item) => clicked.push((item as FakeEl).tag)
    );
    assert.equal(n, 1);
    assert.equal(clicked.length, 1);
  });
});
