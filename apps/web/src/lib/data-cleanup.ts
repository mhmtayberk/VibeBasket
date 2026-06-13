import { sql } from "drizzle-orm";
import { db, sessions, verificationTokens, catalogSyncRuns, bundles } from "@vibebasket/core";

const CLEANUP_INTERVAL_MS = 3600_000; // 1 hour
const MAX_CATALOG_SYNC_ROWS = 200;

let lastCleanup = 0;

export async function cleanupStaleData(force = false) {
	const now = Date.now();
	if (!force && now - lastCleanup < CLEANUP_INTERVAL_MS) return;
	lastCleanup = now;

	try {
		await db.run(sql`DELETE FROM sessions WHERE expires < ${Math.floor(now / 1000)}`);
		await db.run(sql`DELETE FROM verification_tokens WHERE expires < ${Math.floor(now / 1000)}`);

		const totalResult = await db.select({ count: sql<number>`count(*)` }).from(catalogSyncRuns);

		await db.delete(bundles).where(
			sql`${bundles.expiresAt} < ${Math.floor(Date.now() / 1000)} AND ${bundles.userId} IS NOT NULL`
		);
		const total = Number(totalResult[0]?.count ?? 0);
		if (total > MAX_CATALOG_SYNC_ROWS) {
			const oldestToDelete = await db
				.select({ id: catalogSyncRuns.id })
				.from(catalogSyncRuns)
				.orderBy(sql`${catalogSyncRuns.completedAt} ASC`)
				.limit(total - MAX_CATALOG_SYNC_ROWS);
			if (oldestToDelete.length > 0) {
				const ids = oldestToDelete.map((r) => r.id);
				for (const id of ids) {
					await db.delete(catalogSyncRuns).where(sql`${catalogSyncRuns.id} = ${id}`);
				}
			}
		}

		await db.run(sql`PRAGMA incremental_vacuum`);
	} catch (error) {
		console.warn("Stale data cleanup failed:", error);
	}
}
