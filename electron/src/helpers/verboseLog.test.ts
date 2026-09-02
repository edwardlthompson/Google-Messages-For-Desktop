import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMainLogLine, MAIN_LOG_LINE_MAX } from "./verboseLog.ts";

describe("formatMainLogLine", () => {
  it("joins args and caps length", () => {
    assert.equal(formatMainLogLine(["hi", 1]), "hi 1");
    assert.equal(formatMainLogLine(["x".repeat(MAIN_LOG_LINE_MAX + 10)]).length, MAIN_LOG_LINE_MAX);
  });
});
