import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isExpectedDownloadMime } from "./downloadMime.ts";

describe("isExpectedDownloadMime", () => {
  it("allows common media and rejects odd types", () => {
    assert.equal(isExpectedDownloadMime("image/jpeg"), true);
    assert.equal(isExpectedDownloadMime("application/pdf"), true);
    assert.equal(isExpectedDownloadMime("application/x-msdownload"), false);
    assert.equal(isExpectedDownloadMime(""), false);
  });
});
