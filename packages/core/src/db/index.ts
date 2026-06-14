import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { and, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

const CATALOG_ITEM_COLUMNS = [
  "description",
  "icon",
  "source_name",
  "source_url",
  "first_seen_at",
  "last_seen_at",
  "last_synced_at",
] as const;

type SqlExecutor = {
  execute: (sql: string) => Promise<unknown>;
};

type SqlRow = Record<string, unknown>;
type SqlRowsResult<Row extends SqlRow = SqlRow> = {
  rows?: Row[];
};

type ColumnSpec = {
  name: string;
  sql: string;
};

type TableRebuildSpec = {
  tableName: string;
  createSql: string;
  expectedColumns: readonly string[];
  requiredColumns: readonly string[];
  uniqueChecks?: Array<{
    columns: readonly string[];
    errorMessage: string;
  }>;
};

const AUTH_AND_STACK_TABLE_REBUILDS: readonly TableRebuildSpec[] = [
  {
    tableName: "users",
    createSql: `
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        email_verified INTEGER,
        image TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `,
    expectedColumns: ["id", "name", "email", "email_verified", "image", "created_at", "updated_at"],
    requiredColumns: ["id"],
    uniqueChecks: [
      {
        columns: ["email"],
        errorMessage:
          "Cannot enable users_email_unique because duplicate non-null user emails already exist.",
      },
    ],
  },
  {
    tableName: "accounts",
    createSql: `
      CREATE TABLE accounts (
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, provider_account_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    expectedColumns: [
      "user_id",
      "type",
      "provider",
      "provider_account_id",
      "refresh_token",
      "access_token",
      "expires_at",
      "token_type",
      "scope",
      "id_token",
      "session_state",
    ],
    requiredColumns: ["user_id", "type", "provider", "provider_account_id"],
  },
  {
    tableName: "sessions",
    createSql: `
      CREATE TABLE sessions (
        session_token TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        expires INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    expectedColumns: ["session_token", "user_id", "expires"],
    requiredColumns: ["session_token", "user_id", "expires"],
  },
  {
    tableName: "verification_tokens",
    createSql: `
      CREATE TABLE verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `,
    expectedColumns: ["identifier", "token", "expires"],
    requiredColumns: ["identifier", "token", "expires"],
    uniqueChecks: [
      {
        columns: ["token"],
        errorMessage:
          "Cannot enable verification_tokens_token_unique because duplicate verification tokens already exist.",
      },
    ],
  },
  {
    tableName: "saved_stacks",
    createSql: `
      CREATE TABLE saved_stacks (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    expectedColumns: ["id", "user_id", "name", "description", "created_at", "updated_at"],
    requiredColumns: ["id", "user_id", "name"],
    uniqueChecks: [
      {
        columns: ["user_id", "name"],
        errorMessage:
          "Cannot enable saved_stacks_user_name_unique because duplicate stack names already exist for the same user.",
      },
    ],
  },
  {
    tableName: "saved_stack_items",
    createSql: `
      CREATE TABLE saved_stack_items (
        id TEXT PRIMARY KEY NOT NULL,
        stack_id TEXT NOT NULL,
        catalog_item_id TEXT NOT NULL,
        catalog_item_type TEXT NOT NULL,
        snapshot_display_name TEXT NOT NULL,
        snapshot_description TEXT,
        position INTEGER NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (stack_id) REFERENCES saved_stacks(id) ON DELETE CASCADE
      )
    `,
    expectedColumns: [
      "id",
      "stack_id",
      "catalog_item_id",
      "catalog_item_type",
      "snapshot_display_name",
      "snapshot_description",
      "position",
      "created_at",
    ],
    requiredColumns: [
      "id",
      "stack_id",
      "catalog_item_id",
      "catalog_item_type",
      "snapshot_display_name",
      "position",
    ],
  },
  {
    tableName: "saved_stack_targets",
    createSql: `
      CREATE TABLE saved_stack_targets (
        id TEXT PRIMARY KEY NOT NULL,
        stack_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (stack_id) REFERENCES saved_stacks(id) ON DELETE CASCADE
      )
    `,
    expectedColumns: ["id", "stack_id", "target_id", "position"],
    requiredColumns: ["id", "stack_id", "target_id", "position"],
  },
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

export function resolveDatabaseUrl(opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): string {
  const env = opts.env ?? process.env;
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const candidates = [opts.cwd ?? process.cwd(), MODULE_DIR];

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

async function getTableColumns(targetClient: SqlExecutor, tableName: string) {
  const tableInfo = await targetClient.execute(`PRAGMA table_info(${tableName})`);
  return new Set(
    ((tableInfo as SqlRowsResult<{ name?: unknown }>).rows ?? []).map((row) =>
      String(row.name ?? ""),
    ),
  );
}

async function tableExists(targetClient: SqlExecutor, tableName: string) {
  const result = await targetClient.execute(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = '${tableName}'
    LIMIT 1
  `);

  return (((result as SqlRowsResult).rows ?? []).length ?? 0) > 0;
}

async function countRows(targetClient: SqlExecutor, tableName: string) {
  const result = await targetClient.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
  const value = (result as SqlRowsResult<{ count?: unknown }>).rows?.[0]?.count;
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function assertNoDuplicateRows(
  targetClient: SqlExecutor,
  tableName: string,
  columns: readonly string[],
  errorMessage: string,
) {
  const duplicateCheck = await targetClient.execute(`
    SELECT 1
    FROM ${tableName}
    WHERE ${columns.map((column) => `${column} IS NOT NULL`).join(" AND ")}
    GROUP BY ${columns.join(", ")}
    HAVING COUNT(*) > 1
    LIMIT 1
  `);

  if ((((duplicateCheck as SqlRowsResult).rows ?? []).length ?? 0) > 0) {
    throw new Error(errorMessage);
  }
}

async function rebuildTable(targetClient: SqlExecutor, spec: TableRebuildSpec) {
  if (!(await tableExists(targetClient, spec.tableName))) {
    await targetClient.execute(spec.createSql);
    return;
  }

  const existingColumns = await getTableColumns(targetClient, spec.tableName);
  const rowCount = await countRows(targetClient, spec.tableName);
  const copyColumns = spec.expectedColumns.filter((column) => existingColumns.has(column));
  const missingRequiredColumns = spec.requiredColumns.filter(
    (column) => !existingColumns.has(column),
  );

  if (rowCount > 0 && missingRequiredColumns.length > 0) {
    throw new Error(
      `Cannot safely upgrade ${spec.tableName}: missing required columns ${missingRequiredColumns.join(", ")} on a non-empty table.`,
    );
  }

  for (const check of spec.uniqueChecks ?? []) {
    if (check.columns.every((column) => existingColumns.has(column))) {
      await assertNoDuplicateRows(targetClient, spec.tableName, check.columns, check.errorMessage);
    }
  }

  const tempTableName = `__vb_rebuild_${spec.tableName}`;
  await targetClient.execute(`DROP TABLE IF EXISTS ${tempTableName}`);
  await targetClient.execute(
    spec.createSql.replace(`CREATE TABLE ${spec.tableName}`, `CREATE TABLE ${tempTableName}`),
  );

  if (copyColumns.length > 0) {
    await targetClient.execute(`
      INSERT INTO ${tempTableName} (${copyColumns.join(", ")})
      SELECT ${copyColumns.join(", ")}
      FROM ${spec.tableName}
    `);
  }

  await targetClient.execute(`DROP TABLE ${spec.tableName}`);
  await targetClient.execute(`ALTER TABLE ${tempTableName} RENAME TO ${spec.tableName}`);
}

async function ensureTableColumns(
  targetClient: SqlExecutor,
  tableName: string,
  columns: ColumnSpec[],
) {
  const existingColumns = await getTableColumns(targetClient, tableName);

  for (const column of columns) {
    if (!existingColumns.has(column.name)) {
      await targetClient.execute(`ALTER TABLE ${tableName} ADD COLUMN ${column.sql}`);
    }
  }

  return existingColumns;
}

async function bootstrapDatabase(targetClient: SqlExecutor) {
  await targetClient.execute("PRAGMA journal_mode = WAL");
  await targetClient.execute("PRAGMA foreign_keys = ON");
  await targetClient.execute("PRAGMA busy_timeout = 5000");
  await targetClient.execute("PRAGMA cache_size = -64000");
  await targetClient.execute("PRAGMA synchronous = NORMAL");
  await targetClient.execute("PRAGMA journal_size_limit = 67108864");
  await targetClient.execute("PRAGMA temp_store = MEMORY");
  await targetClient.execute(`
    CREATE TABLE IF NOT EXISTS catalog_items (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      source_name TEXT,
      source_url TEXT,
      data TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      first_seen_at INTEGER,
      last_seen_at INTEGER,
      last_synced_at INTEGER,
      created_at INTEGER
    )
  `);
  await targetClient.execute(`
    CREATE TABLE IF NOT EXISTS bundles (
      id TEXT PRIMARY KEY NOT NULL,
      manifest TEXT NOT NULL,
      user_id TEXT,
      expires_at INTEGER,
      created_at INTEGER
    )
  `);

  const existingBundleColumns = await ensureTableColumns(targetClient, "bundles", [
    { name: "user_id", sql: "user_id TEXT" },
    { name: "expires_at", sql: "expires_at INTEGER" },
  ]);

  if (existingBundleColumns.size > 0) {
    await targetClient.execute(`
      UPDATE bundles
      SET expires_at = coalesce(expires_at, created_at + 86400000)
      WHERE expires_at IS NULL
    `);
  }

  const existingCatalogColumns = await ensureTableColumns(targetClient, "catalog_items", [
    { name: "description", sql: "description TEXT" },
    { name: "icon", sql: "icon TEXT" },
    { name: "source_name", sql: "source_name TEXT" },
    { name: "source_url", sql: "source_url TEXT" },
    { name: "first_seen_at", sql: "first_seen_at INTEGER" },
    { name: "last_seen_at", sql: "last_seen_at INTEGER" },
    { name: "last_synced_at", sql: "last_synced_at INTEGER" },
  ]);

  if (CATALOG_ITEM_COLUMNS.some((column) => !existingCatalogColumns.has(column))) {
    await targetClient.execute(`
      UPDATE catalog_items
      SET
        first_seen_at = COALESCE(first_seen_at, created_at),
        last_seen_at = COALESCE(last_seen_at, created_at),
        last_synced_at = COALESCE(last_synced_at, created_at)
    `);
  }

  await targetClient.execute(`
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
  await targetClient.execute(`
    CREATE TABLE IF NOT EXISTS backup_storage_config (
      id TEXT PRIMARY KEY NOT NULL DEFAULT 'default',
      backend TEXT NOT NULL DEFAULT 'local',
      encrypted_config TEXT,
      updated_at INTEGER
    )
  `);
  await targetClient.execute(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER
    )
  `);
  const foreignKeyStatus = await targetClient.execute("PRAGMA foreign_keys");
  const foreignKeysWereEnabled =
    String(
      (foreignKeyStatus as SqlRowsResult<{ foreign_keys?: unknown }>).rows?.[0]?.foreign_keys ??
        "1",
    ) !== "0";

  await targetClient.execute("PRAGMA foreign_keys = OFF");
  await targetClient.execute("BEGIN IMMEDIATE");
  try {
    for (const spec of AUTH_AND_STACK_TABLE_REBUILDS) {
      await rebuildTable(targetClient, spec);
    }

    const foreignKeyCheck = await targetClient.execute("PRAGMA foreign_key_check");
    if ((((foreignKeyCheck as SqlRowsResult).rows ?? []).length ?? 0) > 0) {
      throw new Error("Foreign key validation failed while upgrading auth or saved stack tables.");
    }

    await targetClient.execute("COMMIT");
  } catch (error) {
    await targetClient.execute("ROLLBACK");
    throw error;
  } finally {
    await targetClient.execute(`PRAGMA foreign_keys = ${foreignKeysWereEnabled ? "ON" : "OFF"}`);
  }
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_items_type_verified_name
    ON catalog_items(type, verified, display_name)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_items_created_at
    ON catalog_items(created_at)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_items_sync
    ON catalog_items(source_name, verified, last_synced_at)
  `);

  // Compound index for recommended sort (avoids temp b-tree)
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_items_rec_sort
    ON catalog_items(type, verified, source_name, last_synced_at DESC, display_name ASC)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_sync_runs_completed_at
    ON catalog_sync_runs(completed_at)
  `);
  await targetClient.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
    ON users(email)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS accounts_user_id_idx
    ON accounts(user_id)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS sessions_user_id_expires_idx
    ON sessions(user_id, expires)
  `);
  await targetClient.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS verification_tokens_token_unique
    ON verification_tokens(token)
  `);
  await targetClient.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS saved_stacks_user_name_unique
    ON saved_stacks(user_id, name)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS saved_stacks_user_id_updated_at_idx
    ON saved_stacks(user_id, updated_at)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS saved_stack_items_stack_id_position_idx
    ON saved_stack_items(stack_id, position)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS saved_stack_targets_stack_id_position_idx
    ON saved_stack_targets(stack_id, position)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_catalog_items_source_name
    ON catalog_items(source_name)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_saved_stack_items_catalog_item_id
    ON saved_stack_items(catalog_item_id)
  `);
  await targetClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_bundles_expires_user
    ON bundles(expires_at, user_id)
  `);

  // FTS5 full-text search for catalog items (content-sync with triggers)
  await targetClient.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS catalog_items_fts USING fts5(
      display_name,
      description,
      source_url,
      content='catalog_items',
      content_rowid='rowid'
    )
  `);

  // Keep FTS5 index in sync with catalog_items via triggers
  await targetClient.execute(`
    CREATE TRIGGER IF NOT EXISTS catalog_items_ai AFTER INSERT ON catalog_items BEGIN
      INSERT INTO catalog_items_fts(rowid, display_name, description, source_url)
      VALUES (new.rowid, new.display_name, new.description, new.source_url);
    END
  `);
  await targetClient.execute(`
    CREATE TRIGGER IF NOT EXISTS catalog_items_ad AFTER DELETE ON catalog_items BEGIN
      INSERT INTO catalog_items_fts(catalog_items_fts, rowid, display_name, description, source_url)
      VALUES ('delete', old.rowid, old.display_name, old.description, old.source_url);
    END
  `);
  await targetClient.execute(`
    CREATE TRIGGER IF NOT EXISTS catalog_items_au AFTER UPDATE ON catalog_items BEGIN
      INSERT INTO catalog_items_fts(catalog_items_fts, rowid, display_name, description, source_url)
      VALUES ('delete', old.rowid, old.display_name, old.description, old.source_url);
      INSERT INTO catalog_items_fts(rowid, display_name, description, source_url)
      VALUES (new.rowid, new.display_name, new.description, new.source_url);
    END
  `);

  // Populate FTS5 index if empty (first run or migration)
  const ftsCount = (await targetClient.execute(
    "SELECT count(*) as cnt FROM catalog_items_fts",
  )) as { rows: Array<{ cnt: number }> };
  if (ftsCount.rows[0]?.cnt === 0) {
    await targetClient.execute(
      "INSERT INTO catalog_items_fts(rowid, display_name, description, source_url) SELECT rowid, display_name, description, source_url FROM catalog_items",
    );
  }
}

export function ensureDatabaseSchema(targetClient: SqlExecutor = client) {
  if (targetClient !== client) {
    return bootstrapDatabase(targetClient);
  }

  if (!ensureIndexesPromise) {
    ensureIndexesPromise = bootstrapDatabase(targetClient).catch((error) => {
      ensureIndexesPromise = null;
      throw error;
    });
  }

  return ensureIndexesPromise;
}

export function ensureDatabaseIndexes() {
  return ensureDatabaseSchema();
}

export const db = drizzle(client, { schema });
export * from "./schema";
export { like, or, and, eq };
