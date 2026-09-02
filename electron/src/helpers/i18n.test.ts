import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogEs } from "./catalogEs.ts";
import {
  formatCopy,
  languageFromLocale,
  localizedCatalog,
  lookupCopy,
  setActiveLanguage,
} from "./i18n.ts";

describe("languageFromLocale", () => {
  it("maps Spanish locales and falls back to English", () => {
    assert.equal(languageFromLocale("es-MX"), "es");
    assert.equal(languageFromLocale("es"), "es");
    assert.equal(languageFromLocale("en-US"), "en");
    assert.equal(languageFromLocale(""), "en");
    assert.equal(languageFromLocale("fr-FR"), "en");
  });
});

describe("lookupCopy", () => {
  it("uses the overlay then English", () => {
    const en = { "menu.file": "&File" };
    setActiveLanguage("es");
    assert.equal(lookupCopy("menu.file", en, catalogEs), catalogEs["menu.file"]);
    setActiveLanguage("en");
    assert.equal(lookupCopy("menu.file", en, catalogEs), "&File");
    assert.equal(lookupCopy("missing.key", en, catalogEs), "missing.key");
  });
});

describe("localizedCatalog / formatCopy", () => {
  it("proxies settings keys and interpolates", () => {
    const en = { "settings.title": "&Settings" };
    const copy = localizedCatalog(en, catalogEs);
    setActiveLanguage("es");
    assert.equal(copy["settings.title"], catalogEs["settings.title"]);
    setActiveLanguage("en-US");
    assert.equal(copy["settings.title"], "&Settings");
    assert.match(
      formatCopy("Version {latest} is available", { latest: "1.9.0" }),
      /1\.9\.0/
    );
  });
});
