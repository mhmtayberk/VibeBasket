import { resolvePublicBaseUrl } from "@/lib/public-url";
import type { MetadataRoute } from "next";

/**
 * Highly secure, dynamic robots.txt builder.
 * Mitigates information leakage by explicitly disallowing crawlers from indexing
 * administrative dashboards, private auth sessions, and user stacks databases.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolvePublicBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/docs"],
      disallow: [
        "/stacks",
        "/stacks/",
        "/admin",
        "/admin/",
        "/api/admin/",
        "/api/auth/",
        "/api/stacks/",
        "/_next/",
        "/static/",
      ],
    },
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
