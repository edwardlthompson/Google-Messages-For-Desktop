import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMessagesGoogleUrl,
  messagesLoadUrlOptions,
  MESSAGES_WEB_ENTRY_URL,
  MESSAGES_WEB_URL,
  spaProbeShowsBlank,
  spaProbeShowsReady,
} from "./messagesBoot.ts";

describe("isMessagesGoogleUrl", () => {
  it("matches Messages hosts only", () => {
    assert.equal(isMessagesGoogleUrl(MESSAGES_WEB_URL), true);
    assert.equal(isMessagesGoogleUrl(MESSAGES_WEB_ENTRY_URL), true);
    assert.equal(
      isMessagesGoogleUrl("https://messages.google.com/web/conversations"),
      true
    );
    assert.equal(isMessagesGoogleUrl("about:blank"), false);
    assert.equal(isMessagesGoogleUrl("https://google.com/"), false);
  });
});

describe("spaProbeShowsBlank", () => {
  it("treats missing mw-app on Messages URL as blank", () => {
    assert.equal(
      spaProbeShowsBlank({
        href: MESSAGES_WEB_URL,
        hasMw: false,
        bodyLen: 0,
      }),
      true
    );
    assert.equal(
      spaProbeShowsBlank({
        href: MESSAGES_WEB_URL,
        hasMw: true,
        bodyLen: 1000,
      }),
      false
    );
    assert.equal(spaProbeShowsBlank(null), true);
  });
});

describe("spaProbeShowsReady", () => {
  it("requires mw-app even when the shell HTML is large", () => {
    assert.equal(
      spaProbeShowsReady({
        href: MESSAGES_WEB_URL,
        hasMw: false,
        bodyLen: 50_000,
      }),
      false
    );
    assert.equal(
      spaProbeShowsReady({
        href: MESSAGES_WEB_URL,
        hasMw: true,
        bodyLen: 50_000,
      }),
      true
    );
    assert.equal(spaProbeShowsReady(null), false);
  });
});

describe("messagesLoadUrlOptions", () => {
  it("does not bypass the Chromium HTTP cache", () => {
    const opts = messagesLoadUrlOptions();
    assert.equal(
      Object.prototype.hasOwnProperty.call(opts, "bypassHttpCache"),
      false
    );
    assert.deepEqual(opts, {});
  });
});
