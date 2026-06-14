import { catalogItems, db } from "@vibebasket/core";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";

/**
 * Intelligent, dynamic sitemap builder.
 * Resolves the database state to determine catalog sync freshness, exposing
 * only safe, verified public landing pages with dynamic modification headers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://vibebasket.dev" : "http://localhost:3000");
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
    {
      url: `${normalizedBase}/stacks`,
      lastModified: latestUpdate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
