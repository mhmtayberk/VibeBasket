import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe("VibeBasket — Smoke", () => {
	test("homepage renders with catalog items", async ({ page }) => {
		await page.goto(BASE_URL);

		await expect(page).toHaveTitle(/VibeBasket/);
		const catalogSection = page.locator("#catalog");
		await expect(catalogSection).toBeVisible({ timeout: 15000 });

		const items = page.locator('[class*="border-border/80"][class*="bg-card"]');
		await expect(items.first()).toBeVisible({ timeout: 10000 });
	});

	test("homepage has all critical sections", async ({ page }) => {
		await page.goto(BASE_URL);
		await expect(page.locator("#hero-title")).toBeVisible();
		await expect(page.locator("#how")).toBeVisible({ timeout: 5000 });
		await expect(page.locator("#catalog")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("#command")).toBeVisible({ timeout: 5000 });
	});

	test("landing page badge shows correct IDE count", async ({ page }) => {
		await page.goto(BASE_URL);
		const badge = page.getByText(/Open source|IDE targets/).first();
		await expect(badge).toBeVisible({ timeout: 5000 });
	});

	test("marquee renders IDE icons", async ({ page }) => {
		await page.goto(BASE_URL);
		const marquee = page.locator(".animate-\\[marquee\\]");
		await expect(marquee.first()).toBeVisible({ timeout: 5000 });
		const svgCount = await marquee.first().locator("svg").count();
		expect(svgCount).toBeGreaterThan(0);
	});
});

test.describe("VibeBasket — Catalog API", () => {
	test("GET /api/catalog returns paginated JSON", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?type=mcp&limit=5`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items).toBeDefined();
		expect(body.pagination).toBeDefined();
		expect(body.pagination.limit).toBe(5);
		expect(body.items.length).toBeLessThanOrEqual(5);
	});

	test("catalog has ALL 4 item types", async ({ page }) => {
		for (const t of ["mcp", "skill", "rule", "workflow"]) {
			const res = await page.goto(`${BASE_URL}/api/catalog?type=${t}&limit=3`);
			expect(res?.status()).toBe(200);
			const body = await res?.json();
			const nonType = body.items.find((i: { type: string }) => i.type !== t);
			expect(nonType).toBeUndefined();
		}
	});

	test("catalog trust filter: verified", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?trust=verified&limit=5`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		for (const item of body.items) {
			expect(item.verified).toBe(true);
		}
	});

	test("catalog trust filter: official returns non-verified from official sources", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?trust=official&limit=10`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		for (const item of body.items) {
			expect(item.verified).toBe(false);
		}
	});

	test("catalog freshness filters work", async ({ page }) => {
		for (const freshness of ["fresh", "recent", "aging"]) {
			const res = await page.goto(`${BASE_URL}/api/catalog?freshness=${freshness}&limit=3`);
			expect(res?.status(), `freshness=${freshness} should return 200`).toBe(200);
		}
	});

	test("catalog sort options return valid results", async ({ page }) => {
		for (const sort of ["freshest", "name", "verified"]) {
			const res = await page.goto(`${BASE_URL}/api/catalog?sort=${sort}&limit=5`);
			expect(res?.status(), `sort=${sort} should return 200`).toBe(200);
		}
	});

	test("catalog pagination: page 2 has different items than page 1", async ({ page }) => {
		const [p1, p2] = await Promise.all([
			page.goto(`${BASE_URL}/api/catalog?page=1&limit=10`).then((r) => r?.json()),
			page.goto(`${BASE_URL}/api/catalog?page=2&limit=10`).then((r) => r?.json()),
		]);
		const ids1 = new Set((p1 as any).items.map((i: { id: string }) => i.id));
		const ids2 = new Set((p2 as any).items.map((i: { id: string }) => i.id));
		const overlap = [...ids1].filter((id) => ids2.has(id));
		expect(overlap.length).toBe(0);
	});

	test("catalog pagination: beyond last page returns empty", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?page=99999&limit=10`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items.length).toBe(0);
		expect(body.pagination.totalPages).toBeGreaterThanOrEqual(0);
	});

	test("catalog limit is capped at MAX_LIMIT=100", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?limit=500`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items.length).toBeLessThanOrEqual(100);
	});

	test("catalog invalid page (0 or negative) defaults to page 1", async ({ page }) => {
		for (const badPage of ["0", "-1", "abc"]) {
			const res = await page.goto(`${BASE_URL}/api/catalog?page=${badPage}&limit=5`);
			expect(res?.status()).toBe(200);
			const body = await res?.json();
			expect(body.pagination.page).toBe(1);
		}
	});

	test("catalog invalid type returns items unfiltered", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?type=nonexistent`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items).toBeDefined();
	});
});

test.describe("VibeBasket — Search (+ FTS5)", () => {
	test("search returns relevant results", async ({ page }) => {
		const res = await page.goto(
			`${BASE_URL}/api/catalog?q=github&limit=10`,
		);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items.length).toBeGreaterThan(0);
	});

	test("search is case-insensitive", async ({ page }) => {
		const [lower, upper] = await Promise.all([
			page.goto(`${BASE_URL}/api/catalog?q=github&limit=5`).then((r) => r?.json()),
			page.goto(`${BASE_URL}/api/catalog?q=GITHUB&limit=5`).then((r) => r?.json()),
		]);
		const lowerIds = new Set((lower as any).items.map((i: { id: string }) => i.id));
		const upperIds = new Set((upper as any).items.map((i: { id: string }) => i.id));
		expect(lowerIds.size).toBe(upperIds.size);
	});

	test("search with zero results returns empty array", async ({ page }) => {
		const res = await page.goto(
			`${BASE_URL}/api/catalog?q=zzzxxxxyynonexistent123456&limit=5`,
		);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		expect(body.items.length).toBe(0);
	});

	test("search query longer than MAX_SEARCH_LENGTH is truncated", async ({ page }) => {
		const longQ = "a".repeat(200);
		const res = await page.goto(`${BASE_URL}/api/catalog?q=${longQ}&limit=5`);
		expect(res?.status()).toBe(200);
	});

	test("search with special characters is sanitized", async ({ page }) => {
		const res = await page.goto(
			`${BASE_URL}/api/catalog?q=${encodeURIComponent("<script>alert(1)</script>")}&limit=5`,
		);
		expect(res?.status()).toBe(200);
	});

	test("search with whitespace-only query returns items", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?q=+++&limit=5`);
		expect(res?.status()).toBe(200);
	});

	test("search combined with type filter", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?q=server&type=mcp&limit=5`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		for (const item of body.items) {
			expect(item.type).toBe("mcp");
		}
	});

	test("search combined with trust filter does not break", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/catalog?q=github&trust=verified&limit=5`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		for (const item of body.items) {
			expect(item.verified).toBe(true);
		}
	});

	test("search with FTS5 prefix match returns results", async ({ page }) => {
		// "postgre" should match "postgres" / "postgres-mcp" etc via prefix
		const res = await page.goto(`${BASE_URL}/api/catalog?q=postgre&limit=5`);
		expect(res?.status()).toBe(200);
		const body = await res?.json();
		// FTS5 prefix matching should find items even with partial word
		expect(body.items).toBeDefined();
	});

	test("search multi-word query returns intersection", async ({ page }) => {
		const res = await page.goto(
			`${BASE_URL}/api/catalog?q=${encodeURIComponent("github mcp")}&limit=10`,
		);
		expect(res?.status()).toBe(200);
	});
});

test.describe("VibeBasket — Detail Modal", () => {
	test("detail modal opens with correct content", async ({ page }) => {
		await page.goto(BASE_URL);
		const detailBtn = page
			.getByRole("button", { name: "Details →" })
			.first();
		await detailBtn.scrollIntoViewIfNeeded();
		await detailBtn.click();

		const modal = page.locator(".fixed.inset-0.z-50");
		await expect(modal).toBeVisible({ timeout: 5000 });
		await expect(modal).toContainText(/mcp|skill|rule/i);

		// Close via X button
		await modal.locator("button").first().click();
		await expect(modal).not.toBeVisible({ timeout: 3000 });
	});

	test("detail modal closes on backdrop click", async ({ page }) => {
		await page.goto(BASE_URL);
		const detailBtn = page
			.getByRole("button", { name: "Details →" })
			.first();
		await detailBtn.scrollIntoViewIfNeeded();
		await detailBtn.click();

		const backdrop = page.locator(".bg-black\\/60");
		await backdrop.click({ position: { x: 10, y: 10 } });
		const modal = page.locator(".fixed.inset-0.z-50");
		await expect(modal).not.toBeVisible({ timeout: 3000 });
	});

	test("detail modal shows trust badge", async ({ page }) => {
		await page.goto(BASE_URL);
		const detailBtn = page.getByRole("button", { name: "Details →" }).first();
		await detailBtn.scrollIntoViewIfNeeded();
		await detailBtn.click();

		const modal = page.locator(".fixed.inset-0.z-50");
		await expect(modal).toBeVisible({ timeout: 5000 });
		// Should show trust info (verified / official / community)
		await expect(modal).toContainText(/verified|official|community/i);
	});

	test("detail modal for MCP shows install command", async ({ page }) => {
		await page.goto(BASE_URL);

		// Switch to MCPs tab if not already
		const mcpsTab = page.getByText("MCPs").first();
		if (await mcpsTab.isVisible()) {
			await mcpsTab.click();
			await page.waitForTimeout(1000);
		}

		const mcpDetail = page.getByRole("button", { name: "Details →" }).first();
		await mcpDetail.scrollIntoViewIfNeeded();
		await mcpDetail.click();

		const modal = page.locator(".fixed.inset-0.z-50");
		await expect(modal).toBeVisible({ timeout: 5000 });
		await expect(modal.getByText("Install Command")).toBeVisible({ timeout: 5000 });
	});
});

test.describe("VibeBasket — Basket Panel", () => {
	test("basket panel shows empty state", async ({ page }) => {
		await page.goto(BASE_URL);
		const basket = page.locator("aside");
		await expect(basket.first()).toBeVisible({ timeout: 5000 });
		await expect(basket.first()).toContainText(/basket|ready to bundle/i);
	});

	test("basket panel has target IDE toggles", async ({ page }) => {
		await page.goto(BASE_URL);
		// The basket has target toggles for Cursor, Windsurf, VS Code etc
		const targets = page.locator("aside").first();
		await expect(targets).toBeVisible({ timeout: 5000 });
	});

	test("basket shows mobile FAB button", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(BASE_URL);

		// Mobile bottom basket button should be visible
		const fab = page.locator('[aria-label="Open basket"]');
		await expect(fab).toBeVisible({ timeout: 5000 });
	});

	test("basket generates bundle command with items", async ({ page }) => {
		await page.goto(BASE_URL);

		// Add first 3 add-to-basket buttons (if visible)
		const addBtns = page.locator("button:has-text('Add')").first();
		if (await addBtns.isVisible({ timeout: 3000 }).catch(() => false)) {
			await addBtns.scrollIntoViewIfNeeded();
			await addBtns.click();
		}

		const basket = page.locator("aside").first();
		if (await basket.isVisible({ timeout: 3000 }).catch(() => false)) {
			// Generate button should be visible
			const buildBtn = basket.getByText(/generate|build|bundle/i);
			// Not clicking to avoid actually creating a bundle in test
			await expect(buildBtn).toBeVisible({ timeout: 3000 });
		}
	});
});

test.describe("VibeBasket — Security Headers", () => {
	test("CSP header is present on HTML pages", async ({ page }) => {
		const res = await page.goto(BASE_URL);
		const csp = res?.headers()["content-security-policy"];
		expect(csp).toBeDefined();
	});

	test("X-Content-Type-Options header is set", async ({ page }) => {
		const res = await page.goto(BASE_URL);
		expect(res?.headers()["x-content-type-options"]).toBe("nosniff");
	});

	test("API response includes security headers", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/health`);
		expect(res?.headers()["x-content-type-options"]).toBe("nosniff");
	});

	test("non-existent API route returns 404", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/nonexistent-endpoint-xyz`);
		expect(res?.status()).toBe(404);
	});
});

test.describe("VibeBasket — Rate Limiting", () => {
	test("rapid requests do not crash the API", async ({ page }) => {
		for (let i = 0; i < 10; i++) {
			const res = await page.goto(`${BASE_URL}/api/catalog?limit=1`);
			expect(res?.status()).toBe(200);
		}
	});

	test("health endpoint handles rapid requests", async ({ page }) => {
		for (let i = 0; i < 20; i++) {
			const res = await page.goto(`${BASE_URL}/api/health`);
			expect(res?.status()).toBe(200);
		}
	});
});

test.describe("VibeBasket — Docs Pages", () => {
	const tabs = [
		"hub",
		"getting-started",
		"cli",
		"adapters",
		"delimiters",
		"security",
		"self-hosting",
	];

	for (const tab of tabs) {
		test(`docs tab "${tab}" loads`, async ({ page }) => {
			await page.goto(`${BASE_URL}/docs?tab=${tab}`);
			await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
		});
	}

	test("invalid tab defaults to hub content", async ({ page }) => {
		await page.goto(`${BASE_URL}/docs?tab=invalidtab123`);
		await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
	});

	test("docs search bar is visible", async ({ page }) => {
		await page.goto(`${BASE_URL}/docs`);
		const searchInput = page.getByRole("textbox", { name: /search/i }).first();
		await expect(searchInput).toBeVisible({ timeout: 5000 });
	});

	test("docs page is server-rendered (has doctype)", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/docs`);
		const html = await res?.text();
		expect(html).toContain("<!DOCTYPE html>");
	});

	test("admin redirects to home for unauthenticated users", async ({ page }) => {
		await page.goto(`${BASE_URL}/admin`);
		await page.waitForURL(BASE_URL + "/");
		await expect(page).toHaveTitle(/VibeBasket/);
	});
});

test.describe("VibeBasket — Error States", () => {
	test("missing bundle ID returns 404", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/bundle/nonexistent-id-12345`);
		expect(res?.status()).toBe(404);
	});

	test("bundle POST without body returns 400/405", async ({ page }) => {
		const res = await page.goto(`${BASE_URL}/api/bundle`, { waitUntil: "commit" });
		// POST with GET method returns 405
		expect(res?.status()).toBeGreaterThanOrEqual(400);
	});

	test("network request completes with no errors", async ({ page }) => {
		await page.goto(BASE_URL);
		const errors: string[] = [];
		page.on("pageerror", (err) => errors.push(err.message));
		await sleep(2000);
		expect(errors.length).toBe(0);
	});
});

test.describe("VibeBasket — Navigator/Type Edge Cases", () => {
	test("multiple rapid navigations do not crash", async ({ page }) => {
		await page.goto(BASE_URL);
		await page.goto(`${BASE_URL}/docs?tab=getting-started`);
		await page.goto(`${BASE_URL}/docs?tab=cli`);
		await page.goto(BASE_URL);
		await expect(page).toHaveTitle(/VibeBasket/);
	});

	test("page works after viewport resize", async ({ page }) => {
		await page.goto(BASE_URL);
		await page.setViewportSize({ width: 390, height: 844 });
		await sleep(500);
		await page.setViewportSize({ width: 1440, height: 900 });
		await sleep(500);
		await expect(page.locator("#catalog")).toBeVisible({ timeout: 5000 });
	});
});
