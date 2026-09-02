import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  downloadProgressLabel,
  shouldOpenDownloadedMedia,
} from "./downloadProgress.ts";

describe("downloadProgress", () => {
  it("opens media types and formats percent", () => {
    assert.equal(shouldOpenDownloadedMedia("image/jpeg"), true);
    assert.equal(shouldOpenDownloadedMedia("application/pdf"), false);
    assert.equal(shouldOpenDownloadedMedia("application/x-msdownload"), false);
    assert.equal(downloadProgressLabel(50, 100), "Downloading 50%");
    assert.equal(downloadProgressLabel(1, 0), "Downloading…");
  });
});
