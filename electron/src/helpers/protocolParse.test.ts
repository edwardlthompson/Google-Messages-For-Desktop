import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findProtocolArg,
  normalizeNumber,
  parseProtocolUrl,
} from "./protocolParse.ts";

describe("normalizeNumber", () => {
  it("strips scheme and keeps E.164 plus", () => {
    assert.equal(normalizeNumber("sms:+15551212"), "+15551212");
    assert.equal(normalizeNumber("tel:555-1212"), "5551212");
  });

  it("returns empty for blank input", () => {
    assert.equal(normalizeNumber(""), "");
  });
});

describe("parseProtocolUrl", () => {
  it("returns null for missing or non-protocol strings", () => {
    assert.equal(parseProtocolUrl(null), null);
    assert.equal(parseProtocolUrl("https://messages.google.com"), null);
  });

  it("parses sms/tel numbers", () => {
    assert.equal(parseProtocolUrl("sms:+15551212"), "+15551212");
    assert.equal(parseProtocolUrl("tel:5551212"), "5551212");
  });

  it("treats bare im: as open-only", () => {
    assert.equal(parseProtocolUrl("im:"), "");
    assert.equal(parseProtocolUrl("im:open"), "");
  });
});

describe("findProtocolArg", () => {
  it("finds the first protocol argv", () => {
    assert.equal(
      findProtocolArg(["--foo", "sms:5551212", "tel:1"]),
      "sms:5551212"
    );
    assert.equal(findProtocolArg(["--foo", "bar"]), null);
  });
});
