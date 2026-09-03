import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  shouldDismissSplash,
  shouldOpenSplash,
  shouldRevealMain,
  SPLASH_FALLBACK_MS,
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

describe("shouldDismissSplash", () => {
  it("dismisses on first paint, onboarding, or the fallback timer", () => {
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
  it("ships a local branded loading page", () => {
    const html = readFileSync(join(resources, "splash.html"), "utf8");
    assert.match(html, /id="heading"/);
    assert.match(html, /id="lede"/);
    assert.match(html, /splash-ui\.js/);
    assert.match(html, /prefers-reduced-motion/);
  });
});
