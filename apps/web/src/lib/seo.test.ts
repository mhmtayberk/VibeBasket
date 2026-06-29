import { describe, expect, it } from "vitest";
import { PUBLIC_SITEMAP_ROUTES, ROBOTS_DISALLOW_PATHS } from "./seo";

describe("seo route policy", () => {
  it("keeps only explicitly public routes in the sitemap registry", () => {
    expect(PUBLIC_SITEMAP_ROUTES).toEqual([
      {
        path: "/",
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        path: "/docs",
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ]);
  });

  it("does not disallow the admin UI in robots.txt", () => {
    expect(ROBOTS_DISALLOW_PATHS).not.toContain("/admin");
    expect(ROBOTS_DISALLOW_PATHS).not.toContain("/admin/");
  });
});
