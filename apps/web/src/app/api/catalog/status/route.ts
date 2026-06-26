import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";
import { catalogItems, catalogSyncRuns, db, ensureDatabaseIndexes } from "@vibebasket/core";
import { asc, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const SYNC_INTERVAL_MS = 60 * 60 * 1000;
const STATUS_RATE_LIMIT = 5;
const STATUS_RATE_WINDOW_MS = 60 * 1000;

export async function GET(request: Request) {
  try {
    const rateLimit = checkRateLimit(
      `catalog-status:${getClientAddress(request)}`,
      STATUS_RATE_LIMIT,
      STATUS_RATE_WINDOW_MS,
    );
    if (!rateLimit.allowed) {
      return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
    }

    await ensureDatabaseIndexes();

    const [counts, latestCatalogItem, latestSyncRun] = await Promise.all([
      db
        .select({
          type: catalogItems.type,
          total: sql<number>`count(*)`,
        })
        .from(catalogItems)
        .groupBy(catalogItems.type)
        .orderBy(asc(catalogItems.type)),
      db
        .select({
          createdAt: catalogItems.createdAt,
          lastSyncedAt: catalogItems.lastSyncedAt,
        })
        .from(catalogItems)
        .orderBy(desc(catalogItems.lastSyncedAt), desc(catalogItems.createdAt))
        .limit(1),
      db.select().from(catalogSyncRuns).orderBy(desc(catalogSyncRuns.completedAt)).limit(1),
    ]);

    const latestCreatedAt = latestCatalogItem[0]?.createdAt ?? null;
    const latestCatalogSyncAt = latestCatalogItem[0]?.lastSyncedAt ?? latestCreatedAt;
    const completedAt = latestSyncRun[0]?.completedAt ?? null;

    return applySecurityHeaders(
      NextResponse.json({
        counts: counts.reduce<Record<string, number>>((acc, row) => {
          acc[row.type] = Number(row.total ?? 0);
          return acc;
        }, {}),
        freshness: {
          latestCatalogItemAt: latestCreatedAt,
          latestCatalogSyncAt,
          stale:
            latestCatalogSyncAt instanceof Date
              ? Date.now() - latestCatalogSyncAt.getTime() >= SYNC_INTERVAL_MS
              : true,
        },
        lastSync: latestSyncRun[0]
          ? {
              trigger: latestSyncRun[0].trigger,
              success: latestSyncRun[0].success,
              totalItems: latestSyncRun[0].totalItems,
              mcps: latestSyncRun[0].mcps,
              skills: latestSyncRun[0].skills,
              rules: latestSyncRun[0].rules,
              workflows: latestSyncRun[0].workflows,
              durationMs: latestSyncRun[0].durationMs,
              sourceErrors: latestSyncRun[0].sourceErrors,
              startedAt: latestSyncRun[0].startedAt,
              completedAt,
            }
          : null,
      }),
    );
  } catch (error) {
    console.error("Failed to fetch catalog status:", error);
    return applySecurityHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
    );
  }
}
