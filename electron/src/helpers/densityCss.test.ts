import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { densityCssFilename, parseDensityPreset } from "./densityCss.ts";

describe("parseDensityPreset", () => {
  it("allowlists built-in files and defaults unknown values", () => {
    assert.equal(parseDensityPreset("compact"), "compact");
    assert.equal(parseDensityPreset("comfortable"), "comfortable");
    assert.equal(parseDensityPreset("nope"), "default");
    assert.equal(densityCssFilename("default"), null);
    assert.equal(densityCssFilename("compact"), "compact.css");
  });
});
