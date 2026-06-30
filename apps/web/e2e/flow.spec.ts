import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

type CatalogApiResponse = {
  items: Array<{
    id: string;
    type: string;
    verified?: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function getCatalog(request: APIRequestContext, path: string) {
  return request.get(path);
}

test.describe("VibeBasket — Smoke", () => {
  test("homepage renders core product sections and public links", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/VibeBasket/);
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.locator("#catalog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /ready to bundle/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^GitHub$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^npm$/i })).toBeVisible();
  });

  test("homepage exposes login CTA and install flow anchor", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /build your basket/i })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: /documentation/i }),
    ).toBeVisible();
  });

  test("mobile viewport keeps the catalog search available", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("textbox", { name: /search mcp servers/i })).toBeVisible();
  });
});

test.describe("VibeBasket — Catalog API", () => {
  test("GET /api/catalog returns paginated JSON", async ({ request }) => {
    const response = await getCatalog(request, "/api/catalog?type=mcp&limit=5");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as CatalogApiResponse;
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.pagination.limit).toBe(5);
    expect(body.items.length).toBeLessThanOrEqual(5);
  });

  test("catalog type filters return matching item types", async ({ request }) => {
    for (const type of ["mcp", "skill", "rule", "workflow"]) {
      const response = await getCatalog(request, `/api/catalog?type=${type}&limit=3`);
      expect(response.status()).toBe(200);

      const body = (await response.json()) as CatalogApiResponse;
      expect(body.items.every((item) => item.type === type)).toBe(true);
    }
  });

  test("verified trust filter only returns verified items", async ({ request }) => {
    const response = await getCatalog(request, "/api/catalog?trust=verified&limit=10");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as CatalogApiResponse;
    expect(body.items.every((item) => item.verified === true)).toBe(true);
  });

  test("search is case-insensitive", async ({ request }) => {
    const [lowerResponse, upperResponse] = await Promise.all([
      getCatalog(request, "/api/catalog?q=github&limit=5"),
      getCatalog(request, "/api/catalog?q=GITHUB&limit=5"),
    ]);

    const lower = (await lowerResponse.json()) as CatalogApiResponse;
    const upper = (await upperResponse.json()) as CatalogApiResponse;

    expect(lowerResponse.status()).toBe(200);
    expect(upperResponse.status()).toBe(200);

    const lowerIds = new Set(lower.items.map((item) => item.id));
    const upperIds = new Set(upper.items.map((item) => item.id));
    expect([...lowerIds]).toEqual([...upperIds]);
  });

  test("catalog pagination returns different items across pages", async ({ request }) => {
    const [pageOneResponse, pageTwoResponse] = await Promise.all([
      getCatalog(request, "/api/catalog?page=1&limit=10"),
      getCatalog(request, "/api/catalog?page=2&limit=10"),
    ]);

    const pageOne = (await pageOneResponse.json()) as CatalogApiResponse;
    const pageTwo = (await pageTwoResponse.json()) as CatalogApiResponse;
    const pageOneIds = new Set(pageOne.items.map((item) => item.id));
    const overlap = pageTwo.items.filter((item) => pageOneIds.has(item.id));

    expect(pageOneResponse.status()).toBe(200);
    expect(pageTwoResponse.status()).toBe(200);
    expect(overlap).toHaveLength(0);
  });

  test("invalid page values normalize back to page 1", async ({ request }) => {
    for (const badPage of ["0", "-1", "abc"]) {
      const response = await getCatalog(request, `/api/catalog?page=${badPage}&limit=5`);
      expect(response.status()).toBe(200);

      const body = (await response.json()) as CatalogApiResponse;
      expect(body.pagination.page).toBe(1);
    }
  });
});

test.describe("VibeBasket — Security + Docs", () => {
  test("HTML responses include baseline security headers", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.headers()["content-security-policy"]).toBeDefined();
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("docs hub renders and exposes the search control", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: /documentation hub/i })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: /search documentation/i })).toBeVisible();
  });

  test("selected docs tabs render successfully", async ({ page }) => {
    for (const tab of ["hub", "cli", "security", "self-hosting"]) {
      await page.goto(`/docs?tab=${tab}`);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("unauthenticated admin access renders the 403 page", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(403);
    await expect(page).toHaveURL(/\/admin$/);
  });
});
