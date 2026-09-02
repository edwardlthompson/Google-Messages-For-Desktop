import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ONBOARDING_FOCUS_IDS,
  TOUCH_TARGET_MIN_PX,
  onboardingKeyboardHint,
} from "./onboardingKeyboard.ts";

describe("onboarding keyboard path", () => {
  it("names action button ids and a Tab/Enter hint", () => {
    assert.ok(ONBOARDING_FOCUS_IDS.includes("continue"));
    assert.ok(ONBOARDING_FOCUS_IDS.includes("skip"));
    assert.match(onboardingKeyboardHint(), /Tab/);
    assert.match(onboardingKeyboardHint(), /Enter/);
    assert.equal(TOUCH_TARGET_MIN_PX, 44);
  });
});
