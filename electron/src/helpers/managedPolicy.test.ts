import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseManagedPolicy, policyDisablesUpdates } from "./managedPolicy.ts";

describe("parseManagedPolicy", () => {
  it("allowlists booleans and ignores junk", () => {
    assert.deepEqual(parseManagedPolicy(null), {});
    assert.deepEqual(
      parseManagedPolicy({ autostart: false, tray: true, updatesOff: true, extra: 1 }),
      { autostart: false, tray: true, updatesOff: true }
    );
    assert.equal(policyDisablesUpdates({ updatesOff: true }), true);
    assert.equal(policyDisablesUpdates({}), false);
  });
});
