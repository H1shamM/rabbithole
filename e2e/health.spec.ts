import { test, expect } from "@playwright/test";

test("frontend loads and stumble button exists", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator('button:has-text("Stumble")')).toBeVisible();
});
