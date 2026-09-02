import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const html = pathToFileURL(
  path.resolve(__dirname, "../../resources/onboarding.html")
).href;

test("Defaults panel Continue stays disabled until handlers are set", async ({
  page,
}) => {
  await page.goto(html);
  await expect(page.getByRole("heading", { name: /Set messaging defaults/i })).toBeVisible();
  await expect(page.locator("#continue")).toBeDisabled();
  await expect(page.locator("[data-open=sms]")).toBeVisible();
});
