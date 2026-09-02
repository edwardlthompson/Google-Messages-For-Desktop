import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldFlashTaskbar } from "./a11yMotion.ts";

describe("shouldFlashTaskbar", () => {
  it("skips flash when reduce motion is on", () => {
    assert.equal(shouldFlashTaskbar(true, false), true);
    assert.equal(shouldFlashTaskbar(true, true), false);
    assert.equal(shouldFlashTaskbar(false, false), false);
  });
});
