import { expect, test } from "@playwright/test";

test("home page loads, exposes auth CTA, and searches the catalog", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "VibeBasket" })).toBeVisible();
  await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /build your basket/i })).toBeVisible();

  await page.getByRole("textbox", { name: /search mcp servers/i }).fill("github");
  await expect(page.getByText(/github/i).first()).toBeVisible();
});

test("catalog exposes the filters CTA", async ({ page }) => {
  await page.goto("/");

  const filtersButton = page.getByRole("button", { name: /filters/i });
  await expect(filtersButton).toBeVisible();
});
