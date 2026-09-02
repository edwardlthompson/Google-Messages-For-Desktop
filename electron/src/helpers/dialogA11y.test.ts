import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dialogA11yTitle } from "./dialogA11y.ts";

describe("dialogA11yTitle", () => {
  it("keeps a real title and falls back to message", () => {
    assert.equal(dialogA11yTitle("Update available", "x"), "Update available");
    assert.equal(dialogA11yTitle("  ", "GitHub latest is 1.9.0."), "GitHub latest is 1.9.0.");
    assert.equal(dialogA11yTitle("", ""), "Google Messages");
  });
});
