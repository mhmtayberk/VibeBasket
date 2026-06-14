import { ForbiddenError, requireAdminRole } from "@/lib/admin-session";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";
import {
  catalogItems,
  catalogSyncRuns,
  db,
  savedStackItems,
  savedStacks,
  users,
} from "@vibebasket/core";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const ADMIN_STATS_RATE_LIMIT = 30;
const ADMIN_STATS_RATE_WINDOW_MS = 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(
    `admin-stats:${getClientAddress(request)}`,
    ADMIN_STATS_RATE_LIMIT,
    ADMIN_STATS_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }
  try {
    // Assert authorization first
    await requireAdminRole();

    // Query stats in parallel using highly optimized DB statements
    const [userCountResult, stackCountResult, popularItems, lastSyncResult, catalogCounts] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(users),
        db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(savedStacks),
        db
          .select({
            catalogItemId: savedStackItems.catalogItemId,
            displayName: savedStackItems.snapshotDisplayName,
            type: savedStackItems.catalogItemType,
            count: sql<number>`count(${savedStackItems.catalogItemId})`.mapWith(Number),
          })
          .from(savedStackItems)
          .groupBy(
            savedStackItems.catalogItemId,
            savedStackItems.snapshotDisplayName,
            savedStackItems.catalogItemType,
          )
          .orderBy(desc(sql`count(${savedStackItems.catalogItemId})`))
          .limit(5),
        db.select().from(catalogSyncRuns).orderBy(desc(catalogSyncRuns.completedAt)).limit(1),
        db
          .select({
            type: catalogItems.type,
            count: sql<number>`count(*)`.mapWith(Number),
          })
          .from(catalogItems)
          .groupBy(catalogItems.type),
      ]);

    const totalUsers = userCountResult[0]?.count || 0;
    const totalStacks = stackCountResult[0]?.count || 0;
    const lastSync = lastSyncResult[0] || null;

    // Normalize catalog category counts
    const catalogStats = {
      mcp: 0,
      skill: 0,
      rule: 0,
      workflow: 0,
    };
    for (const item of catalogCounts) {
      if (item.type in catalogStats) {
        catalogStats[item.type as keyof typeof catalogStats] = item.count;
      }
    }

    return applySecurityHeaders(
      NextResponse.json({
        success: true,
        stats: {
          totalUsers,
          totalStacks,
          popularItems,
          lastSync,
          catalogStats,
        },
      }),
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Forbidden: Admin authorization required" },
          { status: 403 },
        ),
      );
    }

    console.error("Failed to query admin stats:", error);
    return applySecurityHeaders(
      NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }),
    );
  }
}
