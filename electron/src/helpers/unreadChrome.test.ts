import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dockBadgeForUnread,
  trayTooltipForUnread,
  windowTitleForUnread,
} from "./unreadChrome.ts";

describe("unread chrome copy", () => {
  it("sets title, dock badge, and tooltip with hide-content", () => {
    assert.equal(windowTitleForUnread(false), "Google Messages");
    assert.equal(windowTitleForUnread(true), "Google Messages (unread)");
    assert.equal(dockBadgeForUnread(true), "•");
    assert.equal(dockBadgeForUnread(false), "");
    assert.match(trayTooltipForUnread(true, true, "Ada"), /unread$/);
    assert.equal(trayTooltipForUnread(true, true, "Ada").includes("Ada"), false);
    assert.match(trayTooltipForUnread(true, false, "Ada"), /Ada/);
  });
});
