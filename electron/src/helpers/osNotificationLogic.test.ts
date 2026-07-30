import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_NOTIFY_BODY,
  DEFAULT_NOTIFY_TITLE,
  HIDDEN_NOTIFY_BODY,
  HIDDEN_NOTIFY_TITLE,
  dedupeKey,
  isMessagesGoogleHost,
  parseOsNotifyIpc,
  sanitizePayload,
  shouldShowToast,
} from "./osNotificationLogic.ts";

describe("sanitizePayload", () => {
  it("defaults empty title and body", () => {
    assert.deepEqual(sanitizePayload("", "  ", false), {
      title: DEFAULT_NOTIFY_TITLE,
      body: DEFAULT_NOTIFY_BODY,
    });
  });

  it("keeps non-empty title and body", () => {
    assert.deepEqual(sanitizePayload("Alice", "Hello", false), {
      title: "Alice",
      body: "Hello",
    });
  });

  it("forces hidden content copy", () => {
    assert.deepEqual(sanitizePayload("Alice", "Secret", true), {
      title: HIDDEN_NOTIFY_TITLE,
      body: HIDDEN_NOTIFY_BODY,
    });
  });

  it("coerces non-strings", () => {
    assert.deepEqual(sanitizePayload(null, 42, false), {
      title: DEFAULT_NOTIFY_TITLE,
      body: DEFAULT_NOTIFY_BODY,
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
    });
    assert.deepEqual(parseOsNotifyIpc({ title: 1, body: null }), {
      title: "",
      body: "",
    });
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
