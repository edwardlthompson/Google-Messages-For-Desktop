import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  shouldDismissSplash,
  shouldOpenSplash,
  shouldRevealMain,
  shouldShowMainBeforeLoad,
  SPLASH_BACKGROUND,
  SPLASH_FALLBACK_MS,
  SPLASH_HEIGHT,
  SPLASH_MIN_VISIBLE_MS,
  SPLASH_WIDTH,
} from "./splash.ts";

const resources = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../resources"
);

describe("shouldOpenSplash", () => {
  it("skips when the user starts in the tray", () => {
    assert.equal(shouldOpenSplash(false), true);
    assert.equal(shouldOpenSplash(true), false);
  });
});

describe("shouldRevealMain", () => {
  it("stays hidden for onboarding or start-in-tray", () => {
    assert.equal(
      shouldRevealMain({ blockingOnboarding: false, startInTray: false }),
      true
    );
    assert.equal(
      shouldRevealMain({ blockingOnboarding: true, startInTray: false }),
      false
    );
    assert.equal(
      shouldRevealMain({ blockingOnboarding: false, startInTray: true }),
      false
    );
  });
});

describe("shouldShowMainBeforeLoad", () => {
  it("matches reveal so the SPA is not throttled while the splash covers it", () => {
    assert.equal(
      shouldShowMainBeforeLoad({
        blockingOnboarding: false,
        startInTray: false,
      }),
      true
    );
    assert.equal(
      shouldShowMainBeforeLoad({
        blockingOnboarding: false,
        startInTray: true,
      }),
      false
    );
  });
});

describe("shouldDismissSplash", () => {
  it("dismisses when the messages document loaded, onboarding, or the fallback timer", () => {
    assert.equal(SPLASH_FALLBACK_MS, 15_000);
    assert.equal(
      shouldDismissSplash({
        mainReadyToShow: false,
        blockingOnboarding: false,
        timedOut: false,
      }),
      false
    );
    assert.equal(
      shouldDismissSplash({
        mainReadyToShow: true,
        blockingOnboarding: false,
        timedOut: false,
      }),
      true
    );
    assert.equal(
      shouldDismissSplash({
        mainReadyToShow: false,
        blockingOnboarding: true,
        timedOut: false,
      }),
      true
    );
    assert.equal(
      shouldDismissSplash({
        mainReadyToShow: false,
        blockingOnboarding: false,
        timedOut: true,
      }),
      true
    );
  });
});

describe("splash.html", () => {
  it("ships a local branded loading page with the neon hero", () => {
    const html = readFileSync(join(resources, "splash.html"), "utf8");
    assert.match(html, /id="heading"/);
    assert.match(html, /id="lede"/);
    assert.match(html, /id="hero"/);
    assert.match(html, /splash-hero\.jpg/);
    assert.match(html, /splash-ui\.js/);
    assert.match(html, /prefers-reduced-motion/);
    const hero = join(resources, "splash-hero.jpg");
    assert.equal(existsSync(hero), true);
    assert.ok(statSync(hero).size > 50_000);
    assert.equal(SPLASH_WIDTH, 720);
    assert.equal(SPLASH_HEIGHT, 405);
    assert.equal(SPLASH_BACKGROUND, "#070b12");
    assert.equal(SPLASH_MIN_VISIBLE_MS, 1_200);
  });
});
