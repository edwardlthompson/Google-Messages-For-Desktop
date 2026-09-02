import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isInQuietHours,
  notificationPlatformOptions,
  parseHHmm,
  quietHoursActive,
} from "./quietHours.ts";

describe("parseHHmm", () => {
  it("parses hours and rejects junk", () => {
    assert.equal(parseHHmm("22:00"), 22 * 60);
    assert.equal(parseHHmm("7:30"), 7 * 60 + 30);
    assert.equal(parseHHmm("24:00"), null);
    assert.equal(parseHHmm(""), null);
  });
});

describe("isInQuietHours", () => {
  it("handles same-day and overnight windows", () => {
    const nine = new Date(2026, 0, 1, 21, 0, 0);
    const eleven = new Date(2026, 0, 1, 23, 0, 0);
    const three = new Date(2026, 0, 1, 3, 0, 0);
    const noon = new Date(2026, 0, 1, 12, 0, 0);
    assert.equal(isInQuietHours(eleven, "22:00", "07:00"), true);
    assert.equal(isInQuietHours(three, "22:00", "07:00"), true);
    assert.equal(isInQuietHours(noon, "22:00", "07:00"), false);
    assert.equal(isInQuietHours(nine, "21:00", "08:00"), true);
    assert.equal(isInQuietHours(noon, "22:00", "22:00"), false);
  });
});

describe("quietHoursActive / linux urgency", () => {
  it("requires enabled preset and sets linux urgency", () => {
    const night = new Date(2026, 0, 1, 23, 30, 0);
    assert.equal(quietHoursActive(night, false, "22-07"), false);
    assert.equal(quietHoursActive(night, true, "nope"), false);
    assert.equal(quietHoursActive(night, true, "22-07"), true);
    assert.deepEqual(notificationPlatformOptions("linux"), { urgency: "normal" });
    assert.deepEqual(notificationPlatformOptions("win32"), {});
    assert.deepEqual(notificationPlatformOptions("darwin"), {});
  });
});
