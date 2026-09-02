import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ONBOARDING_FOCUS_IDS } from "./onboardingKeyboard.ts";

const htmlPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../resources/onboarding.html"
);

describe("first-run Defaults panel", () => {
  it("ships Tab/Enter controls and protocol Open buttons", () => {
    const html = fs.readFileSync(htmlPath, "utf8");
    assert.match(html, /data-open="sms"/);
    assert.match(html, /id="continue"/);
    assert.match(html, /id="skip"/);
    assert.match(html, /Tab to a button, then Enter/);
    for (const id of ONBOARDING_FOCUS_IDS) {
      assert.match(html, new RegExp(`id="${id}"`));
    }
  });
});
