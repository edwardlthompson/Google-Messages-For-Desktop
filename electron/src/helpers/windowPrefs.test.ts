import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampZoomFactor, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, rememberZoomAtScale, zoomForScaleFactor } from "./windowPrefs.ts";

describe("clampZoomFactor", () => {
  it("clamps and defaults non-finite values", () => {
    assert.equal(clampZoomFactor(1.25), 1.25);
    assert.equal(clampZoomFactor(0.1), MIN_ZOOM);
    assert.equal(clampZoomFactor(9), MAX_ZOOM);
    assert.equal(clampZoomFactor("nope"), DEFAULT_ZOOM);
    assert.equal(clampZoomFactor(NaN), DEFAULT_ZOOM);
    assert.equal(zoomForScaleFactor({ "1.5": 1.2 }, 1.5, 1), 1.2);
    assert.equal(zoomForScaleFactor({}, 2, 1.1), 1.1);
    assert.equal(rememberZoomAtScale({}, 1.25, 1.3)["1.25"], 1.3);
  });
});
