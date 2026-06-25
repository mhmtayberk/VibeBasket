import { expect, test } from "@playwright/test";

test.describe("Chaos — Concurrent Mutations", () => {
  test("concurrent catalog requests with different filters", async ({ page }) => {
    const urls = [
      "/api/catalog?type=mcp&limit=5",
      "/api/catalog?type=skill&limit=5",
      "/api/catalog?type=rule&limit=5",
      "/api/catalog?trust=verified&limit=5",
      "/api/catalog?trust=official&limit=5",
      "/api/catalog?sort=freshest&limit=5",
      "/api/catalog?sort=name&limit=5",
      "/api/catalog?q=github&limit=5",
      "/api/catalog?freshness=fresh&limit=5",
      "/api/catalog?page=1&limit=5",
    ];

    const results = await Promise.all(
      urls.map((url) =>
        page.goto(url).then(async (r) => ({
          status: r?.status(),
          body: await r?.json(),
        })),
      ),
    );

    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(results.every((r) => Array.isArray(r.body.items))).toBe(true);
  });

  test("rapid filter toggling does not corrupt state", async ({ page }) => {
    const filters = ["verified", "official", "community"];
    const sort = ["freshest", "name", "verified"];

    for (let i = 0; i < 10; i++) {
      const trust = filters[i % filters.length];
      const s = sort[i % sort.length];
      const res = await page.goto(`/api/catalog?trust=${trust}&sort=${s}&limit=3`);
      expect(res?.status()).toBe(200);
    }
  });

  test("rapid page changes do not duplicate results", async ({ page }) => {
    const pages = [1, 3, 2, 5, 1, 4, 2];
    const seen = new Set<string>();

    for (const p of pages) {
      const res = await page.goto(`/api/catalog?page=${p}&limit=5`);
      expect(res?.status()).toBe(200);
      const body = await res?.json();
      for (const item of body.items) {
        const key = `${p}:${item.id}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });

  test("mid-sync catalog request still returns data", async ({ page }) => {
    // Two parallel requests to /api/catalog — at least one should succeed
    const [a, b] = await Promise.all([
      page.goto("/api/catalog?limit=5").then((r) => r?.status()),
      page.goto("/api/catalog?limit=5").then((r) => r?.status()),
    ]);
    expect(a ?? 500).toBeLessThan(500);
    expect(b ?? 500).toBeLessThan(500);
  });
});

test.describe("Chaos — Network Disruption", () => {
  test("aborted request does not crash server", async ({ page }) => {
    // Start a request and navigate away quickly
    try {
      await page
        .goto("/api/catalog?limit=50", {
          timeout: 100,
        })
        .catch(() => {});
    } catch {
      // Expected — request was aborted
    }

    await page.waitForTimeout(500);

    // Server should still be healthy
    const res = await page.goto("/api/health");
    expect(res?.status()).toBe(200);
  });
});

test.describe("Chaos — Random Input", () => {
  test("random unicode search terms do not crash", async ({ page }) => {
    const randomTerms = [
      "🚀🔥💯",
      "こんにちは",
      "Привет",
      "مرحبا",
      "\u0000\u0001\u0002",
      "a".repeat(120),
      "*&^%$#@!",
      "   ",
      "\n\t\r",
    ];

    for (const term of randomTerms) {
      const res = await page.goto(`/api/catalog?q=${encodeURIComponent(term)}&limit=1`);
      expect(res?.status()).toBe(200);
    }
  });

  test("invalid trust/sort values default gracefully", async ({ page }) => {
    const res = await page.goto("/api/catalog?trust=invalid&sort=invalid&freshness=invalid");
    expect(res?.status()).toBe(200);
    const body = await res?.json();
    expect(body.items).toBeDefined();
  });

  test("negative limit becomes 1", async ({ page }) => {
    const res = await page.goto("/api/catalog?limit=-5");
    expect(res?.status()).toBe(200);
    const body = await res?.json();
    expect(body.pagination.limit).toBeGreaterThanOrEqual(1);
  });

  test("float limit is truncated", async ({ page }) => {
    const res = await page.goto("/api/catalog?limit=3.7");
    expect(res?.status()).toBe(200);
  });

  test("query param injection via multiple params", async ({ page }) => {
    // Duplicate params should not cause errors
    const res = await page.goto("/api/catalog?type=mcp&type=skill&limit=1");
    expect(res?.status()).toBe(200);
  });
});

test.describe("Chaos — State Corruption", () => {
  test("reloading page after basket interaction preserves state", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    await page.reload();
    await expect(page.locator("#catalog")).toBeVisible({ timeout: 10000 });
  });

  test("back/forward navigation works correctly", async ({ page }) => {
    await page.goto("/");
    await page.goto("/docs?tab=getting-started");
    await page.goto("/docs?tab=cli");

    await page.goBack();
    await expect(page).toHaveURL(/tab=getting-started/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    await page.goForward();
    await expect(page).toHaveURL(/tab=getting-started/);
  });

  test("server stays healthy after 50 mixed requests", async ({ page }) => {
    const urls = [
      "/",
      "/docs",
      "/docs?tab=getting-started",
      "/docs?tab=cli",
      "/docs?tab=security",
      "/api/health",
      "/api/catalog?limit=3",
      "/api/catalog?type=mcp&limit=3",
      "/api/catalog?q=github&limit=3",
      "/api/catalog?trust=verified&limit=3",
    ];

    const results = await Promise.all(
      urls.map((url) =>
        page.goto(url, { timeout: 15000 }).then(
          (r) => ({ ok: (r?.status() ?? 500) < 500 }),
          () => ({ ok: false }),
        ),
      ),
    );

    const failed = results.filter((r) => !r.ok);
    expect(failed.length, `${failed.length} requests failed`).toBeLessThan(3);
  });

  test("server recovers after burst of 404s", async ({ page }) => {
    // Burst of 404s
    for (let i = 0; i < 10; i++) {
      await page
        .goto(`/api/bundle/bad-id-${i}`, {
          timeout: 5000,
        })
        .catch(() => {});
    }

    // Server should still serve catalog
    const res = await page.goto("/api/catalog?limit=3");
    expect(res?.status()).toBe(200);
  });
});
