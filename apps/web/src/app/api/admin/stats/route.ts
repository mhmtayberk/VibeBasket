import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import {
  db,
  users,
  savedStacks,
  savedStackItems,
  catalogSyncRuns,
  catalogItems
} from "@vibebasket/core";
import { requireAdminRole, ForbiddenError } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Assert authorization first
    await requireAdminRole();

    // Query stats in parallel using highly optimized DB statements
    const [
      userCountResult,
      stackCountResult,
      popularItems,
      lastSyncResult,
      catalogCounts
    ] = await Promise.all([
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
          savedStackItems.catalogItemType
        )
        .orderBy(desc(sql`count(${savedStackItems.catalogItemId})`))
        .limit(5),
      db
        .select()
        .from(catalogSyncRuns)
        .orderBy(desc(catalogSyncRuns.completedAt))
        .limit(1),
      db
        .select({
          type: catalogItems.type,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(catalogItems)
        .groupBy(catalogItems.type)
    ]);

    const totalUsers = userCountResult[0]?.count || 0;
    const totalStacks = stackCountResult[0]?.count || 0;
    const lastSync = lastSyncResult[0] || null;

    // Normalize catalog category counts
    const catalogStats = {
      mcp: 0,
      skill: 0,
      rule: 0,
      workflow: 0
    };
    for (const item of catalogCounts) {
      if (item.type in catalogStats) {
        catalogStats[item.type as keyof typeof catalogStats] = item.count;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalStacks,
        popularItems,
        lastSync,
        catalogStats
      }
    });

  } catch (error) {
    if (error instanceof ForbiddenError) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Forbidden: Admin authorization required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.error("Failed to query admin stats:", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
