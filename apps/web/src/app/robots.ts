import { resolvePublicBaseUrl } from "@/lib/public-url";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/seo";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Dynamic robots.txt builder.
 * Public pages remain crawlable while private or operational endpoints stay out
 * of crawler paths. Sensitive UI routes use page-level noindex metadata rather
 * than robots disallow so search engines can see explicit indexing directives.
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
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
