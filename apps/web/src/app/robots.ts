import { resolvePublicBaseUrl } from "@/lib/public-url";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Highly secure, dynamic robots.txt builder.
 * Mitigates information leakage by explicitly disallowing crawlers from indexing
 * administrative dashboards, private auth sessions, and user stacks databases.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const baseUrl = resolvePublicBaseUrl({
    forwardedHost: requestHeaders.get("x-forwarded-host") ?? undefined,
    forwardedProto: requestHeaders.get("x-forwarded-proto") ?? undefined,
    host: requestHeaders.get("host") ?? undefined,
  });

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
