import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENMO_DONATE_URL } from "./donate.ts";
import {
  ABOUT_KELYVIN_URL,
  ABOUT_ORANGE_URL,
  ABOUT_PRODUCT_NAME,
  aboutCopy,
  aboutCopyrightHtml,
  aboutDescriptionHtml,
} from "./aboutCopy.ts";
import { setActiveLanguage } from "./i18n.ts";

describe("aboutCopy", () => {
  it("names the product, MIT, FOSS, and donate link", () => {
    setActiveLanguage("en");
    assert.equal(aboutCopy["about.name"], ABOUT_PRODUCT_NAME);
    assert.match(aboutCopy["about.foss"], /MIT/);
    assert.match(aboutCopy["about.foss"], /No tracking/i);
    assert.equal(aboutCopy["about.donate"], "Donate via Venmo");
    assert.match(aboutCopyrightHtml(), new RegExp(VENMO_DONATE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(aboutCopyrightHtml(), /MIT License/);
  });

  it("credits OrangeDrangon and kelyvin with real URLs", () => {
    const html = aboutCopyrightHtml();
    assert.match(html, new RegExp(ABOUT_ORANGE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, new RegExp(ABOUT_KELYVIN_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /sms:/);
    assert.match(html, /NOTICE-ORANGEDRANGON/);
  });

  it("describes the app offline without a network call", () => {
    const html = aboutDescriptionHtml("en-US");
    assert.match(html, /Messages for web/);
    assert.match(html, /en-US/);
  });
});
