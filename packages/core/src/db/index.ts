import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { like, or, and, eq } from "drizzle-orm";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

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
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_items_type_verified_name
        ON catalog_items(type, verified, display_name)
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_catalog_items_created_at
        ON catalog_items(created_at)
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
