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
  splashDismissDelayMs,
  SPLASH_BACKGROUND,
  SPLASH_CHROME_WAIT_MS,
  SPLASH_FALLBACK_MS,
  SPLASH_HEIGHT,
  SPLASH_MIN_VISIBLE_MS,
  SPLASH_SPA_POLL_MS,
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
  it("dismisses when the Messages SPA is ready, onboarding, or the fallback timer", () => {
    assert.equal(SPLASH_FALLBACK_MS, 45_000);
    assert.equal(SPLASH_SPA_POLL_MS, 500);
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

describe("splashDismissDelayMs", () => {
  it("waits out the minimum visible window after SPA ready", () => {
    assert.equal(
      splashDismissDelayMs({
        shownAtMs: 1_000,
        nowMs: 1_200,
        minVisibleMs: 800,
      }),
      600
    );
    assert.equal(
      splashDismissDelayMs({
        shownAtMs: 1_000,
        nowMs: 2_000,
        minVisibleMs: 800,
      }),
      0
    );
  });
});

describe("splash.html", () => {
  it("ships a local branded loading page with hero, stages, and CSP for file images", () => {
    const html = readFileSync(join(resources, "splash.html"), "utf8");
    assert.match(html, /id="heading"/);
    assert.match(html, /id="lede"/);
    assert.match(html, /id="hero"/);
    assert.match(html, /id="stepApp"/);
    assert.match(html, /id="stepMsg"/);
    assert.match(html, /id="barFill"/);
    assert.match(html, /splash-ui\.js/);
    assert.match(html, /img-src 'self' file: data:/);
    assert.match(html, /prefers-reduced-motion/);
    const hero = join(resources, "splash-hero.jpg");
    assert.equal(existsSync(hero), true);
    assert.ok(statSync(hero).size > 50_000);
    assert.equal(SPLASH_WIDTH, 720);
    assert.equal(SPLASH_HEIGHT, 520);
    assert.equal(SPLASH_BACKGROUND, "#070b12");
    assert.equal(SPLASH_MIN_VISIBLE_MS, 800);
    assert.equal(SPLASH_CHROME_WAIT_MS, 1_500);
    const ui = readFileSync(join(resources, "splash-ui.js"), "utf8");
    assert.match(ui, /setSplashStage/);
    assert.match(ui, /requestAnimationFrame/);
  });
});
