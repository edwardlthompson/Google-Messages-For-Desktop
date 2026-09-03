import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const html = pathToFileURL(
  path.resolve(__dirname, "../../resources/splash.html")
).href;

test("launch splash shows branded loading copy", async ({ page }) => {
  await page.goto(
    `${html}?heading=${encodeURIComponent("Google Messages")}&lede=${encodeURIComponent("Opening conversations…")}`
  );
  await expect(page.getByRole("heading", { name: "Google Messages" })).toBeVisible();
  await expect(page.locator("#lede")).toHaveText("Opening conversations…");
});
