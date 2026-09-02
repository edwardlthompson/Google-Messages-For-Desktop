import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { liveRegionAnnouncement, parseMutedToastTitles } from "./liveRegion.ts";

describe("liveRegionAnnouncement", () => {
  it("announces only the unread edge without sender text", () => {
    assert.equal(liveRegionAnnouncement(true), "New message");
    assert.equal(liveRegionAnnouncement(false), null);
    assert.deepEqual(parseMutedToastTitles([" Ada ", "Ada", ""]), ["Ada"]);
  });
});
