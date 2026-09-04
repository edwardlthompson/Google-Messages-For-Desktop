import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  captureCrash,
  nextPendingCrash,
  parseStoredCrash,
  sanitizeCrash,
  shouldIgnoreCrash,
} from "./pendingCrash.ts";

describe("shouldIgnoreCrash", () => {
  it("ignores navigation aborts during boot retries", () => {
    assert.equal(
      shouldIgnoreCrash(new Error("ERR_ABORTED (-3) loading 'https://messages.google.com/web/'")),
      true
    );
    assert.equal(shouldIgnoreCrash(new Error("boom")), false);
  });
});

describe("sanitizeCrash", () => {
  it("returns null for empty input and strips paths", () => {
    assert.equal(sanitizeCrash(null), null);
    const hit = sanitizeCrash(new Error("boom"));
    assert.equal(hit?.message, "boom");
    assert.equal(sanitizeCrash(""), null);
    const withPath = sanitizeCrash(new Error("fail C:\\Users\\edwar\\app.js"));
    assert.equal(withPath?.message.includes("Users"), false);
    assert.match(withPath?.message ?? "", /redacted-home/);
  });

  it("redacts email and ignores token/prompt extras on persist parse", () => {
    const hit = sanitizeCrash(new Error("crash user@example.com"));
    assert.equal(hit?.message.includes("@"), false);
    assert.match(hit?.message ?? "", /redacted-email/);
    const parsed = parseStoredCrash({
      message: "kept",
      stack: "trace",
      email: "a@b.c",
      token: "secret",
      prompt: "steal",
    });
    assert.deepEqual(parsed, { message: "kept", stack: "trace" });
    assert.equal(parseStoredCrash({ message: "x" }), null);
  });
});

describe("nextPendingCrash", () => {
  it("stores nothing when opt-in is off", () => {
    const incoming = { message: "x", stack: "" };
    assert.equal(nextPendingCrash(false, incoming, incoming), null);
  });

  it("keeps at most one record (incoming replaces existing)", () => {
    const a = { message: "a", stack: "" };
    const b = { message: "b", stack: "" };
    assert.deepEqual(nextPendingCrash(true, b, a), b);
  });
});

describe("captureCrash", () => {
  it("does not re-enter while busy", () => {
    const existing = { message: "old", stack: "" };
    const again = captureCrash(true, true, new Error("new"), existing);
    assert.equal(again.busy, true);
    assert.equal(again.stored, existing);
  });
});
