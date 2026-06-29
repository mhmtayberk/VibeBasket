import { PUBLIC_SITEMAP_ROUTES } from "@/lib/seo";
import { resolvePublicBaseUrl } from "@/lib/public-url";
import { catalogItems, db } from "@vibebasket/core";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function isMissingCatalogTableError(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  return message.includes("no such table: catalog_items");
}

/**
 * Dynamic sitemap builder.
 * Emits only explicitly public, indexable routes while still reflecting the
 * latest catalog sync freshness and the current deployment host automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const baseUrl = resolvePublicBaseUrl({
    forwardedHost: requestHeaders.get("x-forwarded-host") ?? undefined,
    forwardedProto: requestHeaders.get("x-forwarded-proto") ?? undefined,
    host: requestHeaders.get("host") ?? undefined,
  });
  const normalizedBase = baseUrl.replace(/\/$/, "");

  let latestUpdate = new Date();
  const buildEntries = (lastModified: Date): MetadataRoute.Sitemap =>
    PUBLIC_SITEMAP_ROUTES.map((route) => ({
      url: `${normalizedBase}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }));

  try {
    // Fetch the latest sync date from catalog metadata to reflect true content freshness
    const latestSync = await db
      .select({
        lastSyncedAt: catalogItems.lastSyncedAt,
      })
      .from(catalogItems)
      .orderBy(desc(catalogItems.lastSyncedAt))
      .limit(1);

    if (latestSync[0]?.lastSyncedAt) {
      latestUpdate = latestSync[0].lastSyncedAt;
    }
  } catch (error) {
    if (isMissingCatalogTableError(error)) {
      return buildEntries(latestUpdate);
    }

    console.warn(
      "Sitemap failed to fetch database freshness, falling back to process time:",
      error,
    );
  }

  return buildEntries(latestUpdate);
}

export { isMissingCatalogTableError };
