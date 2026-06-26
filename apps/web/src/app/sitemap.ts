import { resolvePublicBaseUrl } from "@/lib/public-url";
import { catalogItems, db } from "@vibebasket/core";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";

function isMissingCatalogTableError(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  return message.includes("no such table: catalog_items");
}

/**
 * Intelligent, dynamic sitemap builder.
 * Resolves the database state to determine catalog sync freshness, exposing
 * only safe, verified public landing pages with dynamic modification headers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolvePublicBaseUrl();
  const normalizedBase = baseUrl.replace(/\/$/, "");

  let latestUpdate = new Date();
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
      return [
        {
          url: `${normalizedBase}/`,
          lastModified: latestUpdate,
          changeFrequency: "hourly",
          priority: 1.0,
        },
        {
          url: `${normalizedBase}/docs`,
          lastModified: latestUpdate,
          changeFrequency: "weekly",
          priority: 0.9,
        },
      ];
    }

    console.warn(
      "Sitemap failed to fetch database freshness, falling back to process time:",
      error,
    );
  }

  return [
    {
      url: `${normalizedBase}/`,
      lastModified: latestUpdate,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${normalizedBase}/docs`,
      lastModified: latestUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}

export { isMissingCatalogTableError };
