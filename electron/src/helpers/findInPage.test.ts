import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampFindQuery, MAX_FIND_QUERY } from "./findInPage.ts";

describe("clampFindQuery", () => {
  it("caps length and rejects non-strings", () => {
    assert.equal(clampFindQuery(1), "");
    assert.equal(clampFindQuery("ab"), "ab");
    assert.equal(clampFindQuery("x".repeat(MAX_FIND_QUERY + 5)).length, MAX_FIND_QUERY);
  });
});
