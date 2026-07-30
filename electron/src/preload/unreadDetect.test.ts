import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findConversationListRoot,
  isUnreadPresent,
} from "./unreadDetect.ts";

type FakeEl = {
  tag: string;
  attrs: Record<string, string>;
  className: string;
  children: FakeEl[];
  querySelector: (sel: string) => FakeEl | null;
};

function matchesSel(node: FakeEl, sel: string): boolean {
  if (sel === "mws-conversations-list" || sel === "mw-conversation-list") {
    return node.tag === sel;
  }
  if (sel === "[data-e2e-conversation-list]") {
    return Object.prototype.hasOwnProperty.call(
      node.attrs,
      "data-e2e-conversation-list"
    );
  }
  if (sel === ".unread") {
    return node.className.split(/\s+/).includes("unread");
  }
  if (sel === '[data-e2e-is-unread="true"]') {
    return node.attrs["data-e2e-is-unread"] === "true";
  }
  if (sel === '[data-e2e-is-unread=""]') {
    return node.attrs["data-e2e-is-unread"] === "";
  }
  return false;
}

function el(
  tag: string,
  opts: {
    attrs?: Record<string, string>;
    className?: string;
    children?: FakeEl[];
  } = {}
): FakeEl {
  const self: FakeEl = {
    tag,
    attrs: opts.attrs ?? {},
    className: opts.className ?? "",
    children: opts.children ?? [],
    querySelector(sel: string) {
      if (matchesSel(self, sel)) return self;
      for (const child of self.children) {
        const hit = child.querySelector(sel);
        if (hit) return hit;
      }
      return null;
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
