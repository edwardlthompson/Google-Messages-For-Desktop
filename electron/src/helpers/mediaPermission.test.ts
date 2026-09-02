import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDisplayCapturePermission, isMediaPermission, looksLikeCallsUi } from "./mediaPermission.ts";

describe("looksLikeCallsUi", () => {
  it("allows Messages web and Voice, rejects other hosts", () => {
    assert.equal(isMediaPermission("media"), true);
    assert.equal(isDisplayCapturePermission("display-capture"), true);
    assert.equal(isDisplayCapturePermission("media"), false);
    assert.equal(isMediaPermission("notifications"), false);
    assert.equal(
      looksLikeCallsUi("https://messages.google.com/web/conversations"),
      true
    );
    assert.equal(looksLikeCallsUi("https://voice.google.com/calls"), true);
    assert.equal(looksLikeCallsUi("https://evil.example/call"), false);
    assert.equal(looksLikeCallsUi(""), false);
  });
});
