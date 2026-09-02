import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RENDERER_CRASH_MESSAGE,
  rendererCrashShouldReload,
} from "./rendererCrash.ts";

describe("rendererCrashShouldReload", () => {
  it("reloads crashed/oom and keeps a one-line message", () => {
    assert.equal(rendererCrashShouldReload("crashed"), true);
    assert.equal(rendererCrashShouldReload("oom"), true);
    assert.equal(rendererCrashShouldReload("clean-exit"), false);
    assert.match(RENDERER_CRASH_MESSAGE, /Reload/);
  });
});
