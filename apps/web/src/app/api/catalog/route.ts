import { NextResponse } from "next/server";
import { db, catalogItems, like, or, and, eq, ensureDatabaseIndexes } from "@vibebasket/core";
import { asc, desc, sql } from "drizzle-orm";
import { RegistrySyncService } from "@vibebasket/registry";

const SYNC_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 120;
const VALID_CATALOG_TYPES = new Set(["mcp", "skill", "rule", "workflow"]);

let activeCatalogSync: Promise<Awaited<ReturnType<RegistrySyncService["syncAll"]>>> | null = null;
let activeVerifiedSeed: Promise<number> | null = null;
let backgroundSyncScheduled = false;

async function syncCatalogOnce() {
  if (!activeCatalogSync) {
    activeCatalogSync = new RegistrySyncService().syncAll().finally(() => {
      activeCatalogSync = null;
    });
  }

  return activeCatalogSync;
}

async function seedVerifiedCatalogOnce() {
  if (!activeVerifiedSeed) {
    activeVerifiedSeed = new RegistrySyncService().seedVerifiedCatalog().finally(() => {
      activeVerifiedSeed = null;
    });
  }

  return activeVerifiedSeed;
}

function scheduleBackgroundCatalogSync() {
  if (backgroundSyncScheduled || activeCatalogSync) {
    return;
  }

  backgroundSyncScheduled = true;
  setTimeout(() => {
    backgroundSyncScheduled = false;
    void syncCatalogOnce()
      .then((summary) => {
        if (summary.sourceErrors.length > 0) {
          console.warn("Background catalog sync completed with source errors:", summary.sourceErrors);
        }
      })
      .catch((syncError) => {
        console.warn("Background catalog sync failed:", syncError);
      });
  }, 0);
}

function canForceRefresh(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const refreshToken = process.env.CATALOG_REFRESH_TOKEN;
  if (!refreshToken) {
    return false;
  }

  return request.headers.get("x-vibebasket-refresh-token") === refreshToken;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
  const requestedType = searchParams.get("type"); // optional: mcp, skill, rule, workflow
  const type = requestedType && VALID_CATALOG_TYPES.has(requestedType) ? requestedType : null;
  const refresh = searchParams.get("refresh") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const requestedLimit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;
  let shouldScheduleBackgroundSync = false;

  try {
    await ensureDatabaseIndexes();

    const latestCatalogItem = await db
      .select({
        freshnessAt: catalogItems.lastSyncedAt,
      })
      .from(catalogItems)
      .orderBy(desc(catalogItems.lastSyncedAt), desc(catalogItems.createdAt))
      .limit(1);

    const latestSyncedAt = latestCatalogItem[0]?.freshnessAt?.getTime?.() ?? 0;
    const shouldSync = refresh || latestSyncedAt === 0 || Date.now() - latestSyncedAt >= SYNC_INTERVAL_MS;

    if (shouldSync) {
      if (refresh) {
        if (!canForceRefresh(request)) {
          return NextResponse.json({ error: "Refresh is not allowed" }, { status: 403 });
        }

        try {
          const summary = await syncCatalogOnce();
          if (summary.sourceErrors.length > 0) {
            console.warn("Catalog sync completed with source errors:", summary.sourceErrors);
          }
        } catch (syncError) {
          if (latestSyncedAt === 0) {
            throw syncError;
          }
          console.warn("Catalog sync failed, serving cached catalog instead:", syncError);
        }
      } else if (latestSyncedAt === 0) {
        try {
          const seededItems = await seedVerifiedCatalogOnce();
          if (seededItems === 0) {
            console.warn("Verified catalog bootstrap produced zero items.");
          }
        } catch (seedError) {
          console.warn("Verified catalog bootstrap failed:", seedError);
        }
        shouldScheduleBackgroundSync = true;
      } else {
        shouldScheduleBackgroundSync = true;
      }
    }

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(catalogItems.displayName, `%${search}%`),
          like(catalogItems.description, `%${search}%`)
        )
      );
    }
    if (type) {
      conditions.push(eq(catalogItems.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...(conditions as any)) : undefined;

    const [items, totalResult] = await Promise.all([
      db
      .select()
      .from(catalogItems)
      .where(whereClause)
      .orderBy(desc(catalogItems.verified), asc(catalogItems.displayName), asc(catalogItems.id))
      .limit(limit)
      .offset(offset),
      db
        .select({ total: sql<number>`count(*)` })
        .from(catalogItems)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.total ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const response = NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

    if (shouldScheduleBackgroundSync) {
      scheduleBackgroundCatalogSync();
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
