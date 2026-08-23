import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampRefreshHz,
  fastestSameResolutionMode,
  modesFromDisplay,
  preferredWindowRefreshHz,
} from "./displayRefresh.ts";

describe("fastestSameResolutionMode", () => {
  it("returns null for missing modes or size", () => {
    assert.equal(fastestSameResolutionMode(null, 1920, 1080), null);
    assert.equal(fastestSameResolutionMode([], 1920, 1080), null);
    assert.equal(
      fastestSameResolutionMode([{ width: 1920, height: 1080, refreshRate: 144 }], 0, 1080),
      null
    );
  });

  it("picks the fastest mode at the current resolution", () => {
    const best = fastestSameResolutionMode(
      [
        { width: 1920, height: 1080, refreshRate: 60 },
        { width: 1920, height: 1080, refreshRate: 144 },
        { width: 1280, height: 720, refreshRate: 240 },
        { width: 1920, height: 1080, refreshRate: 120 },
      ],
      1920,
      1080
    );
    assert.deepEqual(best, { width: 1920, height: 1080, refreshRate: 144 });
  });

  it("skips invalid rows", () => {
    const best = fastestSameResolutionMode(
      [
        { width: 1920, height: 1080, refreshRate: 0 },
        { width: 1920, height: 1080, refreshRate: Number.NaN },
        { width: 1920, height: 1080, refreshRate: 90 },
      ],
      1920,
      1080
    );
    assert.equal(best?.refreshRate, 90);
  });
});

describe("clampRefreshHz", () => {
  it("rejects empty and out-of-range values", () => {
    assert.equal(clampRefreshHz(null), null);
    assert.equal(clampRefreshHz(0), null);
    assert.equal(clampRefreshHz(-1), null);
    assert.equal(clampRefreshHz(1001), null);
    assert.equal(clampRefreshHz(Number.POSITIVE_INFINITY), null);
  });

  it("rounds a sane rate", () => {
    assert.equal(clampRefreshHz(59.94), 60);
    assert.equal(clampRefreshHz(144), 144);
  });
});

describe("preferredWindowRefreshHz", () => {
  it("returns null without a display", () => {
    assert.equal(preferredWindowRefreshHz(null), null);
  });

  it("uses displayFrequency when no extra modes exist", () => {
    assert.equal(
      preferredWindowRefreshHz({
        size: { width: 2560, height: 1440 },
        displayFrequency: 165,
      }),
      165
    );
  });

  it("prefers a faster same-resolution extra mode", () => {
    assert.equal(
      preferredWindowRefreshHz({
        size: { width: 1920, height: 1080 },
        displayFrequency: 60,
        modes: [
          { width: 1920, height: 1080, refreshRate: 120 },
          { width: 1280, height: 720, refreshRate: 240 },
        ],
      }),
      120
    );
  });
});

describe("modesFromDisplay", () => {
  it("returns empty for a missing display", () => {
    assert.deepEqual(modesFromDisplay(undefined), []);
  });

  it("includes current frequency and extra modes", () => {
    const modes = modesFromDisplay({
      bounds: { width: 1920, height: 1080 },
      displayFrequency: 60,
      displayModes: [{ width: 1920, height: 1080, refreshRate: 144 }],
    });
    assert.equal(modes.length, 2);
    assert.equal(modes[0]?.refreshRate, 60);
    assert.equal(modes[1]?.refreshRate, 144);
  });
});
