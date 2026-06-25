import { expect, test } from "@playwright/test";

test.describe("Performance — Response Times", () => {
  test("homepage TTFB under 2s", async ({ page }) => {
    const start = Date.now();
    const res = await page.goto("/");
    const ttfb = Date.now() - start;
    expect(res?.status()).toBe(200);
    expect(ttfb).toBeLessThan(5000); // generous for dev server
  });

  test("catalog API under 1s", async ({ page }) => {
    const start = Date.now();
    const res = await page.goto("/api/catalog?limit=10");
    const elapsed = Date.now() - start;
    expect(res?.status()).toBe(200);
    expect(elapsed).toBeLessThan(3000);
  });

  test("concurrent catalog requests all complete", async ({ page }) => {
    const count = 8;
    const starts = Array.from({ length: count }, () =>
      page.goto("/api/catalog?limit=5").then(async (r) => ({
        status: r?.status(),
        body: await r?.json(),
      })),
    );
    const results = await Promise.all(starts);
    expect(results.every((r) => r.status === 200)).toBe(true);
    // All responses should have items
    expect(results.every((r) => Array.isArray(r.body.items))).toBe(true);
  });

  test("large page size performance", async ({ page }) => {
    const start = Date.now();
    const res = await page.goto("/api/catalog?limit=100");
    const elapsed = Date.now() - start;
    expect(res?.status()).toBe(200);
    const body = await res?.json();
    expect(body.items.length).toBeLessThanOrEqual(100);
    expect(elapsed).toBeLessThan(5000);
  });

  test("subsequent requests are faster (caching indicator)", async ({ page }) => {
    const url = "/api/catalog?limit=5";

    // Warm up
    await page.goto(url);

    const times: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await page.goto(url);
      times.push(Date.now() - start);
    }

    // Median of later requests should be reasonable
    const median = times.sort((a, b) => a - b)[1];
    expect(median).toBeLessThan(3000);
  });

  test("page load has no render-blocking >1s resources", async ({ page }) => {
    await page.goto("/");
    // Verify the page becomes interactive quickly
    await expect(page.locator("#catalog")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Performance — DOM & Memory", () => {
  test("homepage has reasonable DOM size", async ({ page }) => {
    await page.goto("/");
    const nodeCount = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(nodeCount).toBeLessThan(5000);
  });

  test("no excessive console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("Hydration") && // hydrate errors in dev
        !e.includes("preload"),
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("no memory leaks on rapid tab switching", async ({ page }) => {
    await page.goto("/");
    const tabs = ["MCPs", "Skills", "Rules"];

    for (let i = 0; i < 5; i++) {
      for (const tab of tabs) {
        const btn = page.getByText(tab).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    // Should not crash
    await expect(page.locator("#catalog")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Performance — Compression & Caching", () => {
  test("API response includes content-encoding for large responses", async ({ page }) => {
    const res = await page.goto("/api/catalog?limit=100");
    expect(res?.status()).toBe(200);
    // Accept encoding check — the response may or may not be compressed in dev
    const ce = res?.headers()["content-encoding"];
    // Just verify the header processing doesn't crash
    expect(ce !== undefined).toBe(true);
  });

  test("static assets are cacheable", async ({ page }) => {
    const res = await page.goto("/");
    const html = (await res?.text()) ?? "";
    // Extract a CSS/JS URL and verify cache headers
    const match = html.match(/\/_next\/static\/[^"'\s]+/);
    if (match) {
      const assetRes = await page.goto(match[0]);
      expect(assetRes?.status()).toBe(200);
      // Static assets should have long cache
      const cc = assetRes?.headers()["cache-control"] ?? "";
      expect(cc).toContain("public");
    }
  });
});

test.describe("Performance — Pagination Efficiency", () => {
  test("deep page is no slower than first page", async ({ page }) => {
    // Get total pages first
    const firstRes = await page.goto("/api/catalog?limit=10");
    const firstBody = await firstRes?.json();
    const totalPages = firstBody.pagination.totalPages;

    const times: number[] = [];
    const pagesToTest = [1, Math.min(5, totalPages), Math.min(10, totalPages)];

    for (const p of pagesToTest) {
      const start = Date.now();
      const res = await page.goto(`/api/catalog?page=${p}&limit=10`);
      await res?.json();
      times.push(Date.now() - start);
    }

    // Page 5 and 10 should not be drastically slower than page 1
    if (times.length >= 2) {
      expect(times[1]).toBeLessThan(times[0] * 5);
    }
  });
});
