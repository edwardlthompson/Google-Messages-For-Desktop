import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ebusyHint } from "./ebusyHint.ts";

describe("ebusyHint", () => {
  it("explains a locked win-unpacked tree", () => {
    assert.match(ebusyHint("EBUSY: resource busy or locked") ?? "", /Close Google Messages/);
    assert.equal(ebusyHint("ok"), null);
  });
});
