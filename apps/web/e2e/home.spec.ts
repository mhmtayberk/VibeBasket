import { expect, test } from "@playwright/test";

test("home page loads, exposes auth CTA, and searches the catalog", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "VibeBasket" })).toBeVisible();
  await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /build your basket/i })).toBeVisible();

  await page.getByPlaceholder("Search mcp servers...").fill("github");
  await expect(page.getByText(/github/i).first()).toBeVisible();
});

test("catalog filters can be opened and reset", async ({ page }) => {
  await page.goto("/");

  const filtersButton = page.getByRole("button", { name: /filters/i });
  await filtersButton.click();
  await page.getByRole("button", { name: /^official$/i }).click();
  const clearButton = page.getByRole("button", { name: /^clear$/i }).first();
  await expect(clearButton).toBeVisible();
  await clearButton.click();
  await expect(filtersButton).not.toContainText("1");
});
