import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeDownloadName } from "./downloadName.ts";

describe("safeDownloadName", () => {
  it("strips path punctuation", () => {
    assert.equal(safeDownloadName("a/b.png"), "a_b.png");
    assert.equal(safeDownloadName(".."), "download");
    assert.equal(safeDownloadName(""), "download");
  });
});
