import { sql } from "drizzle-orm";
import { db, sessions, verificationTokens, catalogSyncRuns, bundles } from "@vibebasket/core";

let lastCleanup = 0;

export async function cleanupStaleData() {
	const now = Date.now();
	if (now - lastCleanup < 3600_000) return; // once per hour
	lastCleanup = now;

	try {
		await db.run(sql`DELETE FROM sessions WHERE expires < ${Math.floor(now / 1000)}`);
		await db.run(sql`DELETE FROM verification_tokens WHERE expires < ${Math.floor(now / 1000)}`);

		const keepRows = 200;
		const totalResult = await db.select({ count: sql<number>`count(*)` }).from(catalogSyncRuns);

		// Clean expired registered bundles (older than 365 days)
		await db.delete(bundles).where(
			sql`${bundles.expiresAt} < ${Math.floor(Date.now() / 1000)} AND ${bundles.userId} IS NOT NULL`
		);
		const total = Number(totalResult[0]?.count ?? 0);
		if (total > keepRows) {
			const offset = keepRows;
			const oldestToDelete = await db
				.select({ id: catalogSyncRuns.id })
				.from(catalogSyncRuns)
				.orderBy(sql`${catalogSyncRuns.completedAt} ASC`)
				.limit(total - keepRows);
			if (oldestToDelete.length > 0) {
				const ids = oldestToDelete.map((r) => r.id);
				for (const id of ids) {
					await db.delete(catalogSyncRuns).where(sql`${catalogSyncRuns.id} = ${id}`);
				}
			}
		}

		await db.run(sql`PRAGMA incremental_vacuum`);
	} catch {
		// best-effort cleanup, never crash
	}
}
