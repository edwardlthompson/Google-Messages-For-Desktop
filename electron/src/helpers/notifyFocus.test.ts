import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampConversationIndex,
  conversationIndexForToast,
  normalizeToastTitle,
} from "./notifyFocus.ts";

const rows = [
  { name: "Ada Lovelace", i: 0 },
  { name: "Bob", i: 1 },
];

describe("conversationIndexForToast", () => {
  it("returns null for empty lists", () => {
    assert.equal(conversationIndexForToast("Ada", [], false), null);
    assert.equal(conversationIndexForToast("Ada", null, false), null);
  });

  it("matches exact and prefix names", () => {
    assert.equal(conversationIndexForToast("Bob", rows, false), 1);
    assert.equal(conversationIndexForToast("Ada", rows, false), 0);
  });

  it("uses first thread when hide-content or generic title", () => {
    assert.equal(conversationIndexForToast("Ada", rows, true), 0);
    assert.equal(conversationIndexForToast("Google Messages", rows, false), 0);
    assert.equal(conversationIndexForToast("", rows, false), 0);
  });

  it("returns null when no name matches a specific sender", () => {
    assert.equal(conversationIndexForToast("Carol", rows, false), null);
  });
});

describe("normalizeToastTitle / clampConversationIndex", () => {
  it("trims and rejects hostile indexes", () => {
    assert.equal(normalizeToastTitle("  Ada  "), "Ada");
    assert.equal(normalizeToastTitle(1), "");
    assert.equal(clampConversationIndex(2), 2);
    assert.equal(clampConversationIndex(-1), null);
    assert.equal(clampConversationIndex(1.5), null);
    assert.equal(clampConversationIndex(99), null);
  });
});
