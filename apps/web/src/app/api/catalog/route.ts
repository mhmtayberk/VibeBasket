import { NextResponse } from "next/server";
import { db, catalogItems, like, or, and, eq, ensureDatabaseIndexes } from "@vibebasket/core";
import { asc, desc, sql } from "drizzle-orm";
import { RegistrySyncService } from "@vibebasket/registry";

const SYNC_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

let activeCatalogSync: Promise<Awaited<ReturnType<RegistrySyncService["syncAll"]>>> | null = null;

async function syncCatalogOnce() {
  if (!activeCatalogSync) {
    activeCatalogSync = new RegistrySyncService().syncAll().finally(() => {
      activeCatalogSync = null;
    });
  }

  return activeCatalogSync;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q");
  const type = searchParams.get("type"); // optional: mcp, skill, rule
  const refresh = searchParams.get("refresh") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const requestedLimit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  try {
    await ensureDatabaseIndexes();

    const latestCatalogItem = await db
      .select({ createdAt: catalogItems.createdAt })
      .from(catalogItems)
      .orderBy(desc(catalogItems.createdAt))
      .limit(1);

    const latestCreatedAt = latestCatalogItem[0]?.createdAt?.getTime?.() ?? 0;
    const shouldSync = refresh || latestCreatedAt === 0 || Date.now() - latestCreatedAt >= SYNC_INTERVAL_MS;

    if (shouldSync) {
      try {
        const summary = await syncCatalogOnce();
        if (summary.sourceErrors.length > 0) {
          console.warn("Catalog sync completed with source errors:", summary.sourceErrors);
        }
      } catch (syncError) {
        if (latestCreatedAt === 0) {
          throw syncError;
        }
        console.warn("Catalog sync failed, serving cached catalog instead:", syncError);
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

    return NextResponse.json({
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
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
