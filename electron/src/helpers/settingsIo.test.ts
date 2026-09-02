import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPlainSettingsObject, pickKnownSettings } from "./settingsIo.ts";

describe("pickKnownSettings", () => {
  it("keeps known typed keys and drops junk", () => {
    assert.equal(isPlainSettingsObject([]), false);
    assert.equal(isPlainSettingsObject(null), false);
    const known = { trayEnabled: true, savedZoomFactor: 1 };
    assert.deepEqual(
      pickKnownSettings(
        { trayEnabled: false, savedZoomFactor: 1.2, extra: 1, trayEnabledx: true },
        known
      ),
      { trayEnabled: false, savedZoomFactor: 1.2 }
    );
  });
});
