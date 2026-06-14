"use server";

import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { requireAdminRole } = await import("@/lib/admin-session");
  return requireAdminRole();
}

async function loadCoreRuntime() {
  return import("@vibebasket/core");
}

async function loadDrizzleRuntime() {
  return import("drizzle-orm");
}

export async function getFts5HealthAction() {
  await requireAdmin();
  try {
    const { catalogItems, db } = await loadCoreRuntime();
    const { sql } = await loadDrizzleRuntime();
    const [catalogCount, ftsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(catalogItems),
      db.all<{ cnt: number }>(sql`SELECT count(*) as cnt FROM catalog_items_fts`),
    ]);
    const total = Number(catalogCount[0]?.count ?? 0);
    const ftsTotal = ftsCount[0]?.cnt ?? 0;
    const healthy = total === ftsTotal;
    return { success: true, healthy, catalogRows: total, ftsRows: ftsTotal };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function rebuildFts5Action() {
  await requireAdmin();
  try {
    const { db } = await loadCoreRuntime();
    const { sql } = await loadDrizzleRuntime();
    await db.run(sql`INSERT INTO catalog_items_fts(catalog_items_fts) VALUES('rebuild')`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function getDbHealthAction() {
  await requireAdmin();
  try {
    const { bundles, catalogItems, db, savedStacks, users } = await loadCoreRuntime();
    const { sql } = await loadDrizzleRuntime();
    const tableCounts = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(catalogItems),
      db.select({ count: sql<number>`count(*)` }).from(bundles),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(savedStacks),
    ]);
    const integrity = await db.all<{ ok: string }>(sql`PRAGMA integrity_check`);

    return {
      success: true,
      catalogItems: Number(tableCounts[0][0]?.count ?? 0),
      bundles: Number(tableCounts[1][0]?.count ?? 0),
      users: Number(tableCounts[2][0]?.count ?? 0),
      savedStacks: Number(tableCounts[3][0]?.count ?? 0),
      integrityOk: integrity[0]?.ok === "ok",
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function forceCleanupAction() {
  await requireAdmin();
  try {
    const { cleanupStaleData } = await import("@/lib/data-cleanup");
    await cleanupStaleData(true);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function getUserOverviewAction() {
  await requireAdmin();
  try {
    const { db, savedStacks, users } = await loadCoreRuntime();
    const { sql } = await loadDrizzleRuntime();
    const [totalUsers, recentUsers, totalStacks] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} > ${Math.floor(Date.now() / 1000) - 86400 * 7}`),
      db.select({ count: sql<number>`count(*)` }).from(savedStacks),
    ]);

    return {
      success: true,
      totalUsers: Number(totalUsers[0]?.count ?? 0),
      recentUsers: Number(recentUsers[0]?.count ?? 0),
      totalStacks: Number(totalStacks[0]?.count ?? 0),
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}
