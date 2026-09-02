import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampWindowPosition } from "./clampWindow.ts";

const area = { x: 0, y: 0, width: 1920, height: 1080 };

describe("clampWindowPosition", () => {
  it("keeps on-screen origins and drops off-screen ones", () => {
    assert.deepEqual(
      clampWindowPosition({ x: 40, y: 40 }, { width: 1100, height: 800 }, area),
      { x: 40, y: 40 }
    );
    assert.equal(
      clampWindowPosition({ x: -4000, y: 10 }, { width: 1100, height: 800 }, area),
      null
    );
    assert.equal(clampWindowPosition(null, { width: 1, height: 1 }, area), null);
  });
});
