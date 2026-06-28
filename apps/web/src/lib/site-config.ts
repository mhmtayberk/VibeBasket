import { db, siteConfig } from "@vibebasket/core";
import { eq } from "drizzle-orm";

function parseEmailList(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveAdminEmails(options: {
  databaseValue?: string | null;
  envValue?: string | null | undefined;
}) {
  return [
    ...new Set([...parseEmailList(options.databaseValue), ...parseEmailList(options.envValue)]),
  ];
}

export async function getSiteConfig(key: string): Promise<string | null> {
  try {
    const rows = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
    return rows[0]?.value ?? null;
  } catch (error) {
    console.warn("Failed to read site config:", error);
    return null;
  }
}

export async function setSiteConfig(key: string, value: string): Promise<void> {
  await db
    .insert(siteConfig)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
}

export async function deleteSiteConfig(key: string): Promise<void> {
  await db.delete(siteConfig).where(eq(siteConfig.key, key));
}

export async function getAdminEmails(): Promise<string[]> {
  try {
    const dbValue = await getSiteConfig("admin_emails");
    const envValue = process.env.ADMIN_OAUTH_EMAILS || process.env.ADMIN_EMAILS || "";
    return resolveAdminEmails({ databaseValue: dbValue, envValue });
  } catch (error) {
    console.warn("Failed to read admin emails:", error);
    return [];
  }
}
