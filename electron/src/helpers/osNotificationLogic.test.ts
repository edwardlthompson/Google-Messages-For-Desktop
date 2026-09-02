import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_NOTIFY_BODY,
  DEFAULT_NOTIFY_TITLE,
  HIDDEN_NOTIFY_BODY,
  HIDDEN_NOTIFY_TITLE,
  dedupeKey,
  allowSessionPermission,
  isMessagesGoogleHost,
  parseOsNotifyIpc,
  sanitizePayload,
  shouldShowToast,
  toastReplyActions,
  toastGroupTag,
  isToastTitleMuted,
} from "./osNotificationLogic.ts";

describe("sanitizePayload", () => {
  it("defaults empty title and body", () => {
    assert.deepEqual(sanitizePayload("", "  ", false), {
      title: DEFAULT_NOTIFY_TITLE,
      body: DEFAULT_NOTIFY_BODY,
      conversationIndex: null,
    });
  });

  it("keeps non-empty title and body", () => {
    assert.deepEqual(sanitizePayload("Alice", "Hello", false), {
      title: "Alice",
      body: "Hello",
      conversationIndex: null,
    });
  });

  it("forces hidden content copy", () => {
    assert.deepEqual(sanitizePayload("Alice", "Secret", true), {
      title: HIDDEN_NOTIFY_TITLE,
      body: HIDDEN_NOTIFY_BODY,
      conversationIndex: null,
    });
  });

  it("coerces non-strings", () => {
    assert.deepEqual(sanitizePayload(null, 42, false), {
      title: DEFAULT_NOTIFY_TITLE,
      body: DEFAULT_NOTIFY_BODY,
      conversationIndex: null,
    });
  });
});

describe("shouldShowToast / dedupe", () => {
  it("allows first toast and blocks duplicate within window", () => {
    const payload = sanitizePayload("T", "B", false);
    const first = shouldShowToast(null, payload, 1000, 4000);
    assert.equal(first.show, true);
    const second = shouldShowToast(first.next, payload, 2000, 4000);
    assert.equal(second.show, false);
    const third = shouldShowToast(second.next, payload, 6000, 4000);
    assert.equal(third.show, true);
  });

  it("allows different keys within window", () => {
    const a = sanitizePayload("A", "1", false);
    const b = sanitizePayload("B", "2", false);
    const first = shouldShowToast(null, a, 1000, 4000);
    const second = shouldShowToast(first.next, b, 1500, 4000);
    assert.equal(second.show, true);
    assert.notEqual(dedupeKey(a), dedupeKey(b));
  });
});

describe("parseOsNotifyIpc", () => {
  it("rejects arrays and primitives", () => {
    assert.equal(parseOsNotifyIpc(null), null);
    assert.equal(parseOsNotifyIpc("x"), null);
    assert.equal(parseOsNotifyIpc([]), null);
  });

  it("coerces plain objects", () => {
    assert.deepEqual(parseOsNotifyIpc({ title: "Hi", body: "There" }), {
      title: "Hi",
      body: "There",
      conversationIndex: null,
    });
    assert.deepEqual(parseOsNotifyIpc({ title: 1, body: null }), {
      title: "",
      body: "",
      conversationIndex: null,
    });
    assert.deepEqual(
      parseOsNotifyIpc({ title: "Ada", body: "Hi", conversationIndex: 1 }),
      { title: "Ada", body: "Hi", conversationIndex: 1 }
    );
  });
});

describe("isMessagesGoogleHost", () => {
  it("allows messages.google.com URLs and hosts", () => {
    assert.equal(
      isMessagesGoogleHost("https://messages.google.com/web/"),
      true
    );
    assert.equal(isMessagesGoogleHost("messages.google.com"), true);
  });

  it("rejects other hosts", () => {
    assert.equal(isMessagesGoogleHost("https://evil.com"), false);
    assert.equal(isMessagesGoogleHost("google.com"), false);
    assert.equal(isMessagesGoogleHost("not a url"), false);
  });
});

describe("allowSessionPermission", () => {
  it("allows notifications and clipboard from Messages", () => {
    assert.equal(
      allowSessionPermission(
        "notifications",
        "https://messages.google.com/web/"
      ),
      true
    );
    assert.equal(
      allowSessionPermission("display-capture", "https://messages.google.com/web/"),
      true
    );
  });

  it("denies unknown permissions and other hosts", () => {
    assert.equal(
      allowSessionPermission("geolocation", "https://messages.google.com"),
      false
    );
    assert.equal(
      allowSessionPermission("notifications", "https://evil.com"),
      false
    );
    assert.equal(allowSessionPermission("notifications", ""), false);
  });
});

describe("toast grouping and mute", () => {
  it("never exposes reply actions and tags by conversation", () => {
    assert.equal(toastReplyActions(), undefined);
    assert.equal(
      toastGroupTag({ title: "Ada", body: "Hi", conversationIndex: 2 }),
      "gmfd-2"
    );
    assert.equal(isToastTitleMuted("Ada", ["ada"]), true);
    assert.equal(isToastTitleMuted("Ada", []), false);
  });
});
