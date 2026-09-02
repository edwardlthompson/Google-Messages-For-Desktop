import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowOfflineBanner } from "./loadFail.ts";

describe("shouldShowOfflineBanner", () => {
  it("shows for main-frame network errors and skips aborted/subframes", () => {
    assert.equal(shouldShowOfflineBanner(-106, true), true);
    assert.equal(shouldShowOfflineBanner(-202, true, "ERR_CERT_AUTHORITY_INVALID"), false);
    assert.equal(shouldShowOfflineBanner(-105, true), true);
    assert.equal(shouldShowOfflineBanner(-3, true), false);
    assert.equal(shouldShowOfflineBanner(-106, false), false);
    assert.equal(shouldShowOfflineBanner(0, true), false);
    assert.equal(shouldShowOfflineBanner("nope", true), false);
  });
});
