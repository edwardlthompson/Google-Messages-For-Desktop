import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeUserCss, USER_CSS_MAX } from "./userCss.ts";

describe("sanitizeUserCss", () => {
  it("allows local rules and rejects remote @import", () => {
    assert.equal(sanitizeUserCss("body { zoom: 1.1 }"), "body { zoom: 1.1 }");
    assert.equal(sanitizeUserCss(""), "");
    assert.equal(sanitizeUserCss(null), null);
    assert.equal(sanitizeUserCss("@import url('https://evil/x.css');"), null);
    assert.equal(sanitizeUserCss("x".repeat(USER_CSS_MAX + 10))?.length, USER_CSS_MAX);
  });
});
