import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const resources = path.resolve(__dirname, "../../resources");
const html = pathToFileURL(path.join(resources, "splash.html")).href;
const hero = pathToFileURL(path.join(resources, "splash-hero.jpg")).href;
const logo = pathToFileURL(path.join(resources, "icons", "256x256.png")).href;

test("launch splash shows branded hero and stage bar", async ({ page }) => {
  const qs = new URLSearchParams({
    heading: "Google Messages",
    lede: "Starting desktop app…",
    hero,
    logo,
    labelApp: "App",
    labelAppDone: "App Loaded ✅",
    labelMsg: "Google Messages loading…",
    labelMsgDone: "Google Messages ready ✅",
    hint: "Waiting on Google’s web app.",
  });
  await page.goto(`${html}?${qs.toString()}`);
  await expect(page.getByRole("heading", { name: "Google Messages" })).toBeVisible();
  const heroImg = page.locator("#hero");
  await expect(heroImg).toBeVisible();
  await expect
    .poll(async () => heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(100);
  await expect(page.locator("#stepApp")).toBeVisible();
  await expect(page.locator("#stepMsg")).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { setSplashStage: (s: string) => void }).setSplashStage(
      "app_ready"
    );
  });
  await expect(page.locator("#labelApp")).toHaveText("App Loaded ✅");
  await expect(page.locator("#markApp")).toHaveText("✅");
  await page.evaluate(() => {
    (window as unknown as { setSplashStage: (s: string) => void }).setSplashStage(
      "messages_loading"
    );
  });
  await expect(page.locator("#labelMsg")).toHaveText("Google Messages loading…");
  await page.evaluate(() => {
    (window as unknown as { setSplashStage: (s: string) => void }).setSplashStage(
      "messages_ready"
    );
  });
  await expect(page.locator("#labelMsg")).toHaveText("Google Messages ready ✅");
  await expect(page.locator("#markMsg")).toHaveText("✅");
});
