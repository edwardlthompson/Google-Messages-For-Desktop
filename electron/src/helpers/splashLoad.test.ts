import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  buildSplashQuery,
  splashResourceFiles,
  stageSplashFiles,
} from "./splashLoad.ts";

const resources = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../resources"
);

const copy = {
  heading: "Google Messages",
  lede: "Starting desktop app…",
  labelApp: "App",
  labelAppDone: "App Loaded ✅",
  labelMsg: "Google Messages loading…",
  labelMsgDone: "Google Messages ready ✅",
  hint: "Waiting on Google’s web app.",
};

describe("splashResourceFiles", () => {
  it("points at the packaged splash HTML and hero", () => {
    const files = splashResourceFiles(resources);
    assert.equal(existsSync(files.html), true);
    assert.equal(existsSync(files.script), true);
    assert.equal(existsSync(files.hero), true);
    assert.equal(existsSync(files.logo), true);
  });
});

describe("buildSplashQuery", () => {
  it("includes stage-bar copy so the first HTML paint is not empty", () => {
    const q = buildSplashQuery(copy, "file:///hero.jpg", "file:///logo.png");
    assert.equal(q.heading, "Google Messages");
    assert.match(q.labelAppDone, /App Loaded/);
    assert.match(q.labelMsg, /Google Messages/);
    assert.equal(q.hero, "file:///hero.jpg");
  });
});

describe("stageSplashFiles", () => {
  it("copies a small HTML plus sibling assets for loadFile", () => {
    const dest = mkdtempSync(join(tmpdir(), "gmfd-splash-"));
    try {
      const staged = stageSplashFiles(resources, dest, copy);
      assert.equal(existsSync(staged.htmlPath), true);
      const html = readFileSync(staged.htmlPath, "utf8");
      assert.match(html, /id="barFill"/);
      assert.match(html, /id="stepApp"/);
      assert.ok(html.length < 20_000);
      assert.match(staged.query.hero, /^file:/);
      assert.equal(
        staged.query.hero,
        pathToFileURL(join(dest, "splash-hero.jpg")).href
      );
    } finally {
      rmSync(dest, { recursive: true, force: true });
    }
  });
});
