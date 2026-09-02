import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseUnreadBadgeColor,
  unreadTrayFilenamePrefix,
} from "./unreadBadge.ts";

describe("unreadTrayFilenamePrefix", () => {
  it("uses the red unread asset only for the red badge", () => {
    assert.equal(parseUnreadBadgeColor("accent"), "accent");
    assert.equal(parseUnreadBadgeColor("nope"), "red");
    assert.equal(unreadTrayFilenamePrefix(true, true, "red"), "unread_");
    assert.equal(unreadTrayFilenamePrefix(true, true, "accent"), "");
    assert.equal(unreadTrayFilenamePrefix(true, false, "red"), "");
  });
});
