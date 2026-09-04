import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowContextLink,
  allowMainFrameNavigate,
  allowOpenExternalUrl,
} from "./navigationAllowlist.ts";

describe("navigation allowlist", () => {
  it("allows Messages/auth HTTPS and blocks file/javascript", () => {
    assert.equal(
      allowMainFrameNavigate("https://messages.google.com/web/"),
      true
    );
    assert.equal(allowMainFrameNavigate("https://photos.google.com/"), true);
    assert.equal(allowMainFrameNavigate("file:///tmp/x"), false);
    assert.equal(allowMainFrameNavigate("javascript:alert(1)"), false);
    assert.equal(allowMainFrameNavigate("https://evil.example/"), false);
    assert.equal(
      allowMainFrameNavigate("chrome-error://chromewebdata/"),
      true
    );
  });

  it("allows mailto and support HTTPS for openExternal", () => {
    assert.equal(allowOpenExternalUrl("mailto:a@b.c"), true);
    assert.equal(allowOpenExternalUrl("https://support.google.com/x"), true);
    assert.equal(allowOpenExternalUrl("https://voice.google.com/"), true);
    assert.equal(allowContextLink("https://messages.google.com/u/0"), true);
    assert.equal(allowOpenExternalUrl("http://messages.google.com"), false);
  });
});
