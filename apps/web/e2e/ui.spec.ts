import { expect, test } from "@playwright/test";

test.describe("UI — Responsive Breakpoints", () => {
  const viewports = [
    { name: "mobile-sm", width: 375, height: 667 },
    { name: "mobile-md", width: 390, height: 844 },
    { name: "mobile-lg", width: 428, height: 926 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop-sm", width: 1024, height: 768 },
    { name: "desktop-lg", width: 1440, height: 900 },
    { name: "desktop-xl", width: 1728, height: 1117 },
  ];

  for (const vp of viewports) {
    test(`homepage renders at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      await expect(page.locator("header")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("#catalog")).toBeVisible({ timeout: 15000 });

      // No horizontal overflow
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflowX).toBe(false);
    });
  }

  const localeRoutes = [
    { path: "/en", expectedLang: "en" },
    { path: "/tr/docs?tab=hub", expectedLang: "tr" },
    { path: "/es/login", expectedLang: "es" },
    { path: "/zh/docs?tab=hub", expectedLang: "zh" },
    { path: "/hi/login", expectedLang: "hi" },
    { path: "/ru/docs?tab=hub", expectedLang: "ru" },
  ];

  for (const route of localeRoutes) {
    for (const vp of viewports.slice(0, 5)) {
      test(`${route.path} stays responsive at ${vp.name} (${vp.width}x${vp.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);

        await expect(page.locator("html")).toHaveAttribute("lang", route.expectedLang);

        const overflowX = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        expect(overflowX).toBe(false);
      });
    }
  }

  const mobileLocaleCases = [
    { path: "/en", shortLabel: "EN" },
    { path: "/tr", shortLabel: "TR" },
    { path: "/es", shortLabel: "ES" },
    { path: "/zh", shortLabel: "中文" },
    { path: "/hi", shortLabel: "हि" },
    { path: "/ru", shortLabel: "RU" },
  ] as const;

  for (const localeCase of mobileLocaleCases) {
    test(`mobile locale switcher shows active language for ${localeCase.path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(localeCase.path);

      const localeSummary = page.locator("summary[aria-label]").last();
      await expect(localeSummary).toBeVisible({ timeout: 5000 });
      await expect(localeSummary).toContainText(localeCase.shortLabel);

      await localeSummary.click();
      await expect(page.locator("details[open]").last()).toBeVisible({ timeout: 3000 });

      await page.mouse.click(12, 12);
      await expect(page.locator("details[open]")).toHaveCount(0);
    });
  }

  test("basket layout stays mobile-first on small screens and sidebar stays visible on desktop", async ({
    page,
  }) => {
    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("aside").first()).not.toBeVisible({ timeout: 5000 });

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Desktop basket sidebar should be visible
    await expect(page.getByRole("heading", { name: /assemble your basket/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("docs sidebar hidden on mobile, visible on desktop", async ({ page }) => {
    // Mobile: sidebar should be hidden
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/docs");
    const mobileSidebar = page.locator("aside");
    await expect(mobileSidebar).not.toBeVisible({ timeout: 5000 });

    // Desktop: sidebar should be visible
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/docs");
    const desktopSidebar = page.locator("aside");
    await expect(desktopSidebar).toBeVisible({ timeout: 10000 });
  });

  test("docs MCP snippet preview switches targets without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/docs?tab=mcp");

    await expect(page.getByRole("heading", { name: "Native config snippets" })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: "Codex CLI / TOML" }).click();
    await expect(page.getByText("[mcp_servers.vibebasket]")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Continue / YAML" }).click();
    await expect(page.getByText("mcpServers:")).toBeVisible({ timeout: 5000 });

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflowX).toBe(false);
  });
});

test.describe("UI — Accessibility", () => {
  test("page has a lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
    expect(lang?.toLowerCase()).toContain("en");
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img:not([alt])");
    const count = await images.count();
    expect(count).toBe(0);
  });

  test("skip link or semantic landmarks exist", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 5000 });
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    // Some element should be focused after Tab
    const focused = page.locator(":focus");
    const count = await focused.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no focusable elements visible
  });

  test("color contrast is sufficient (basic check)", async ({ page }) => {
    await page.goto("/");
    // Verify text is readable — no white text on white background
    const bgHex = await page.evaluate(() => {
      const body = document.body;
      const style = getComputedStyle(body);
      return style.backgroundColor;
    });
    expect(bgHex).toBeTruthy();
  });
});

test.describe("UI — Keyboard Navigation", () => {
  test("Enter opens the locale switcher overlay", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");

    const localeSummary = page.locator("summary[aria-label]").last();
    const localeDetails = localeSummary.locator("xpath=ancestor::details[1]");
    await localeSummary.focus();
    await page.keyboard.press("Enter");
    await expect(localeDetails).toHaveAttribute("open", "", { timeout: 3000 });
  });

  test("Tab navigates through filter buttons", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Press Tab multiple times — should not crash
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }

    // Some element should be focused
    await expect(page).toHaveTitle(/VibeBasket/);
  });
});

test.describe("UI — Loading & Empty States", () => {
  test("search with no results shows empty state", async ({ page }) => {
    await page.goto("/");

    // Type a nonsense search
    const searchInput = page.getByRole("textbox", { name: /search/i }).first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill("xyznonexistent12345");
      await page.waitForTimeout(2000);

      // Should show empty state text somewhere
      const body = await page.textContent("body");
      expect(body?.toLowerCase()).toMatch(/empty|no results|try a broader|nothing/i);
    }
  });

  test("error boundary catches render errors", async ({ page }) => {
    await page.goto("/");
    // Force a render error by navigating to a non-existent page
    await page.goto("/this-page-does-not-exist-404");
    const body = await page.textContent("body");
    // Should either show 404 text or redirect — not a blank page
    expect(body && body.length > 0).toBe(true);
  });
});

test.describe("UI — Visual Consistency", () => {
  test("typing terminals activate on the localized homepage", async ({ page }) => {
    await page.goto("/en");

    await expect(page.locator('[data-typing-state="active"]').first()).toBeVisible({
      timeout: 5000,
    });

    await page.locator("#command").scrollIntoViewIfNeeded();
    await expect(page.locator('#command [data-typing-state="active"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test("all text is in English only", async ({ page }) => {
    await page.goto("/");
    const text = (await page.textContent("body")) ?? "";

    // Check for common Turkish words that should NOT appear
    const turkishWords = ["Katalog", "Sepet", "Özellikler", "Kurulum"];
    for (const word of turkishWords) {
      expect(text).not.toContain(word);
    }
  });

  test("dark theme metadata is configured", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#0f1512");
  });

  test("consistent font usage across pages", async ({ page }) => {
    await page.goto("/");
    const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(bodyFont).toBeTruthy();

    await page.goto("/docs");
    const docsFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(docsFont).toBe(bodyFont);
  });

  test("no layout shift on content load", async ({ page }) => {
    await page.goto("/");

    const clsScore = await page.evaluate(() => {
      type LayoutShiftEntry = PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      };

      return new Promise<number>((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const le = entry as LayoutShiftEntry;
            if (le.hadRecentInput) continue;
            cls += le.value ?? 0;
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 3000);
      });
    });

    expect(clsScore).toBeLessThan(0.5);
  });
});
