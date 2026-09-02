import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseThemePref, themeSourceForPref, windowBackgroundForTheme } from "./settingsTheme.ts";

describe("parseThemePref", () => {
  it("defaults missing or invalid values to system", () => {
    assert.equal(parseThemePref(null), "system");
    assert.equal(parseThemePref(""), "system");
    assert.equal(parseThemePref("sepia"), "system");
  });

  it("keeps light, dark, and system", () => {
    assert.equal(parseThemePref("light"), "light");
    assert.equal(parseThemePref("dark"), "dark");
    assert.equal(parseThemePref("system"), "system");
  });
});

describe("themeSourceForPref", () => {
  it("passes light/dark/system through to Chromium (no DOM CSS)", () => {
    assert.equal(themeSourceForPref("light"), "light");
    assert.equal(themeSourceForPref("dark"), "dark");
    assert.equal(themeSourceForPref("system"), "system");
  });
});

describe("windowBackgroundForTheme", () => {
  it("follows the stored preference and system dark flag", () => {
    assert.equal(windowBackgroundForTheme("light", true), "#ffffff");
    assert.equal(windowBackgroundForTheme("dark", false), "#1f1f1f");
    assert.equal(windowBackgroundForTheme("system", true), "#1f1f1f");
    assert.equal(windowBackgroundForTheme("system", false), "#ffffff");
    assert.equal(windowBackgroundForTheme("dark", true, true), "#000000");
    assert.equal(windowBackgroundForTheme("light", false, true), "#ffffff");
  });
});
