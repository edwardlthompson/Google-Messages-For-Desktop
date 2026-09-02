import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProtocolSignature,
  parseSnippet,
  shouldConfirmProtocolCompose,
} from "./composeExtras.ts";

describe("composeExtras", () => {
  it("caps snippets and appends a protocol-only signature", () => {
    assert.equal(parseSnippet("  hi\nthere  "), "hi there");
    assert.equal(parseSnippet("x".repeat(400)).length, 280);
    assert.equal(applyProtocolSignature("Hello", "— Ada"), "Hello\n\n— Ada");
    assert.equal(applyProtocolSignature("", "— Ada"), "— Ada");
    assert.equal(shouldConfirmProtocolCompose(true, "+1555"), true);
    assert.equal(shouldConfirmProtocolCompose(false, "+1555"), false);
    assert.equal(shouldConfirmProtocolCompose(true, ""), false);
  });
});
