import { eq } from "drizzle-orm";
import { db, siteConfig } from "@vibebasket/core";

export async function getSiteConfig(key: string): Promise<string | null> {
	try {
		const rows = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
		return rows[0]?.value ?? null;
	} catch {
		return null;
	}
}

export async function setSiteConfig(key: string, value: string): Promise<void> {
	await db.insert(siteConfig).values({ key, value, updatedAt: new Date() })
		.onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
}

export async function deleteSiteConfig(key: string): Promise<void> {
	await db.delete(siteConfig).where(eq(siteConfig.key, key));
}

export async function getAdminEmails(): Promise<string[]> {
	try {
		const dbValue = await getSiteConfig("admin_emails");
		if (dbValue) return dbValue.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

		const envValue = process.env.ADMIN_OAUTH_EMAILS || process.env.ADMIN_EMAILS || "";
		return envValue.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
	} catch {
		return [];
	}
}
