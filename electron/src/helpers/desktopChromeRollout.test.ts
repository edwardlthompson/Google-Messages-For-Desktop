import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyColorfulTrayRollout } from "./desktopChromeRollout.ts";

describe("applyColorfulTrayRollout", () => {
  it("is a no-op after the flag is set", () => {
    assert.equal(
      applyColorfulTrayRollout({
        colorfulDone: true,
        trayEnabled: false,
        monochromeIconEnabled: true,
      }),
      null
    );
  });

  it("enables tray and color icon once", () => {
    assert.deepEqual(
      applyColorfulTrayRollout({
        colorfulDone: false,
        trayEnabled: false,
        monochromeIconEnabled: true,
      }),
      {
        trayEnabled: true,
        monochromeIconEnabled: false,
        colorfulDone: true,
      }
    );
  });
});
