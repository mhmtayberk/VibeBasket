import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { like, or, and, eq } from "drizzle-orm";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

const CATALOG_ITEM_COLUMNS = [
  "source_name",
  "source_url",
  "first_seen_at",
  "last_seen_at",
  "last_synced_at",
] as const;

function findWorkspaceRoot(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function resolveDatabaseUrl(
  opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): string {
  const env = opts.env ?? process.env;
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const candidates = [
    opts.cwd ?? process.cwd(),
    MODULE_DIR,
  ];

  for (const candidate of candidates) {
    const workspaceRoot = findWorkspaceRoot(candidate);
    if (workspaceRoot) {
      return `file:${path.join(workspaceRoot, "vibebasket.db")}`;
    }
  }

  return `file:${path.join(opts.cwd ?? process.cwd(), "vibebasket.db")}`;
}

export const client = createClient({
  url: resolveDatabaseUrl(),
});

let ensureIndexesPromise: Promise<void> | null = null;

export function ensureDatabaseIndexes() {
  if (!ensureIndexesPromise) {
    ensureIndexesPromise = (async () => {
      const tableInfo = await client.execute("PRAGMA table_info(catalog_items)");
      const existingCatalogColumns = new Set(
        ((tableInfo as any).rows ?? []).map((row: any) => String(row.name ?? ""))
      );

      if (!existingCatalogColumns.has("source_name")) {
        await client.execute("ALTER TABLE catalog_items ADD COLUMN source_name TEXT");
      }
      if (!existingCatalogColumns.has("source_url")) {
        await client.execute("ALTER TABLE catalog_items ADD COLUMN source_url TEXT");
      }
      if (!existingCatalogColumns.has("first_seen_at")) {
        await client.execute("ALTER TABLE catalog_items ADD COLUMN first_seen_at INTEGER");
      }
      if (!existingCatalogColumns.has("last_seen_at")) {
        await client.execute("ALTER TABLE catalog_items ADD COLUMN last_seen_at INTEGER");
      }
      if (!existingCatalogColumns.has("last_synced_at")) {
        await client.execute("ALTER TABLE catalog_items ADD COLUMN last_synced_at INTEGER");
      }

      if (CATALOG_ITEM_COLUMNS.some((column) => !existingCatalogColumns.has(column))) {
        await client.execute(`
          UPDATE catalog_items
          SET
            first_seen_at = COALESCE(first_seen_at, created_at),
            last_seen_at = COALESCE(last_seen_at, created_at),
            last_synced_at = COALESCE(last_synced_at, created_at)
        `);
      }

      await client.execute(`
        CREATE TABLE IF NOT EXISTS catalog_sync_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trigger TEXT NOT NULL,
          success INTEGER NOT NULL,
          total_items INTEGER NOT NULL,
          mcps INTEGER NOT NULL,
          skills INTEGER NOT NULL,
          rules INTEGER NOT NULL,
          workflows INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          source_errors TEXT NOT NULL,
          started_at INTEGER NOT NULL,
          completed_at INTEGER NOT NULL
        )
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_items_type_verified_name
        ON catalog_items(type, verified, display_name)
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_items_created_at
        ON catalog_items(created_at)
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_items_last_synced_at
        ON catalog_items(last_synced_at)
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_sync_runs_completed_at
        ON catalog_sync_runs(completed_at)
      `);
    })().catch((error) => {
      ensureIndexesPromise = null;
      throw error;
    });
  }

  return ensureIndexesPromise;
}

export const db = drizzle(client, { schema });
export * from "./schema";
export { like, or, and, eq };
