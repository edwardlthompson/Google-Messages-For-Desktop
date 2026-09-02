import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSpellCheckLanguage } from "./spellcheckLang.ts";

describe("parseSpellCheckLanguage", () => {
  it("allowlists known codes", () => {
    assert.equal(parseSpellCheckLanguage("fr"), "fr");
    assert.equal(parseSpellCheckLanguage("nope"), "en-US");
    assert.equal(parseSpellCheckLanguage(1), "en-US");
  });
});
