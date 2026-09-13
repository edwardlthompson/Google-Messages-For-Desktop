import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  focusExistingWindow,
  shouldExitForSecondInstance,
} from "./singleInstance.ts";

describe("shouldExitForSecondInstance", () => {
  it("exits when the lock is not acquired", () => {
    assert.equal(shouldExitForSecondInstance(false), true);
    assert.equal(shouldExitForSecondInstance(true), false);
  });
});

describe("focusExistingWindow", () => {
  it("restores a minimized window, then shows a hidden one", () => {
    const calls: string[] = [];
    const win = {
      isDestroyed: () => false,
      isVisible: () => false,
      isMinimized: () => true,
      restore: () => calls.push("restore"),
      show: () => calls.push("show"),
      focus: () => calls.push("focus"),
    };
    assert.equal(focusExistingWindow(win), true);
    assert.deepEqual(calls, ["restore", "show", "focus"]);
  });

  it("returns false when the window is missing or destroyed", () => {
    assert.equal(focusExistingWindow(null), false);
    assert.equal(
      focusExistingWindow({
        isDestroyed: () => true,
        isVisible: () => true,
        isMinimized: () => false,
        show: () => {
          throw new Error("should not show");
        },
        restore: () => {
          throw new Error("should not restore");
        },
        focus: () => {
          throw new Error("should not focus");
        },
      }),
      false
    );
  });
});
