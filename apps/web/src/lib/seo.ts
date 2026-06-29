export type SitemapRouteConfig = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export const PUBLIC_SITEMAP_ROUTES: readonly SitemapRouteConfig[] = [
  {
    path: "/",
    changeFrequency: "hourly",
    priority: 1.0,
  },
  {
    path: "/docs",
    changeFrequency: "weekly",
    priority: 0.9,
  },
] as const;

export const ROBOTS_DISALLOW_PATHS: readonly string[] = [
  "/stacks",
  "/stacks/",
  "/api/admin/",
  "/api/auth/",
  "/api/stacks/",
  "/_next/",
  "/static/",
] as const;
