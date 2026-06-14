import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  accounts,
  ensureDatabaseSchema,
  savedStackItems,
  savedStackTargets,
  savedStacks,
  sessions,
  users,
  verificationTokens,
} from "../index";

const tempDirs: string[] = [];
type SqlRowsResult<Row extends Record<string, unknown>> = { rows?: Row[] };

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    rmSync(tempDir, { force: true, recursive: true });
  }
});

describe("auth and stack schema", () => {
  it("exports core auth and saved stack tables from the package root", () => {
    expect(users).toBeTruthy();
    expect(accounts).toBeTruthy();
    expect(sessions).toBeTruthy();
    expect(verificationTokens).toBeTruthy();
    expect(savedStacks).toBeTruthy();
    expect(savedStackItems).toBeTruthy();
    expect(savedStackTargets).toBeTruthy();
  });

  it("bootstraps auth and saved stack tables safely for an existing sqlite database", async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "vibebasket-core-db-"));
    tempDirs.push(tempDir);

    const dbPath = path.join(tempDir, "bootstrap.db");
    const client = createClient({ url: `file:${dbPath}` });

    await client.execute(`
      CREATE TABLE catalog_items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        display_name TEXT NOT NULL,
        data TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        created_at INTEGER
      )
    `);
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT
      )
    `);
    await client.execute(`
      CREATE TABLE accounts (
        user_id TEXT,
        type TEXT,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        PRIMARY KEY (provider, provider_account_id)
      )
    `);
    await client.execute(`
      CREATE TABLE saved_stacks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL
      )
    `);
    await client.execute(`
      CREATE TABLE saved_stack_items (
        id TEXT PRIMARY KEY,
        stack_id TEXT NOT NULL,
        catalog_item_id TEXT NOT NULL,
        catalog_item_type TEXT NOT NULL,
        snapshot_display_name TEXT NOT NULL,
        position INTEGER NOT NULL
      )
    `);
    await client.execute(`
      INSERT INTO catalog_items (id, type, display_name, data, verified, created_at)
      VALUES ('item-1', 'mcp', 'Item 1', '{}', 1, 1710000000)
    `);
    await client.execute(`
      INSERT INTO users (id, name) VALUES ('user-1', 'User 1')
    `);
    await client.execute(`
      INSERT INTO saved_stacks (id, user_id, name) VALUES ('stack-1', 'user-1', 'My Stack')
    `);
    await client.execute(`
      INSERT INTO saved_stack_items (
        id,
        stack_id,
        catalog_item_id,
        catalog_item_type,
        snapshot_display_name,
        position
      )
      VALUES ('stack-item-1', 'stack-1', 'catalog-1', 'mcp', 'Catalog Item', 0)
    `);

    await ensureDatabaseSchema(client);
    await ensureDatabaseSchema(client);

    const tables = await client.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name IN (
          'users',
          'accounts',
          'sessions',
          'verification_tokens',
          'saved_stacks',
          'saved_stack_items',
          'saved_stack_targets'
        )
      ORDER BY name
    `);
    const tableNames = ((tables as SqlRowsResult<{ name?: unknown }>).rows ?? []).map(
      (row) => row.name,
    );

    expect(tableNames).toEqual([
      "accounts",
      "saved_stack_items",
      "saved_stack_targets",
      "saved_stacks",
      "sessions",
      "users",
      "verification_tokens",
    ]);

    const userColumns = await client.execute("PRAGMA table_info(users)");
    const userColumnNames = ((userColumns as SqlRowsResult<{ name?: unknown }>).rows ?? [])
      .map((row) => row.name)
      .sort();
    expect(userColumnNames).toEqual([
      "created_at",
      "email",
      "email_verified",
      "id",
      "image",
      "name",
      "updated_at",
    ]);

    const savedStackColumns = await client.execute("PRAGMA table_info(saved_stacks)");
    const savedStackColumnNames = (
      (savedStackColumns as SqlRowsResult<{ name?: unknown }>).rows ?? []
    )
      .map((row) => row.name)
      .sort();
    expect(savedStackColumnNames).toEqual([
      "created_at",
      "description",
      "id",
      "name",
      "updated_at",
      "user_id",
    ]);

    const indexList = await client.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index'
        AND name IN (
          'users_email_unique',
          'accounts_user_id_idx',
          'verification_tokens_token_unique',
          'saved_stacks_user_name_unique',
          'sessions_user_id_expires_idx',
          'saved_stacks_user_id_updated_at_idx',
          'saved_stack_items_stack_id_position_idx',
          'saved_stack_targets_stack_id_position_idx'
        )
      ORDER BY name
    `);
    const indexNames = ((indexList as SqlRowsResult<{ name?: unknown }>).rows ?? [])
      .map((row) => row.name)
      .sort();

    expect(indexNames).toEqual(
      [
        "accounts_user_id_idx",
        "saved_stack_items_stack_id_position_idx",
        "saved_stack_targets_stack_id_position_idx",
        "saved_stacks_user_name_unique",
        "saved_stacks_user_id_updated_at_idx",
        "sessions_user_id_expires_idx",
        "users_email_unique",
        "verification_tokens_token_unique",
      ].sort(),
    );

    const redundantProviderIndex = await client.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index'
        AND name = 'accounts_provider_provider_account_id_idx'
    `);

    expect(
      ((redundantProviderIndex as SqlRowsResult<Record<string, unknown>>).rows ?? []).length,
    ).toBe(0);

    await expect(
      client.execute(`
      INSERT INTO saved_stacks (id, user_id, name, created_at, updated_at)
      VALUES ('stack-orphan', 'missing-user', 'Nope', 1710000000, 1710000000)
    `),
    ).rejects.toThrow();

    await client.execute("DELETE FROM users WHERE id = 'user-1'");

    const remainingStacks = await client.execute("SELECT COUNT(*) as count FROM saved_stacks");
    const remainingItems = await client.execute("SELECT COUNT(*) as count FROM saved_stack_items");

    expect((remainingStacks as SqlRowsResult<{ count?: unknown }>).rows?.[0]?.count).toBe(0);
    expect((remainingItems as SqlRowsResult<{ count?: unknown }>).rows?.[0]?.count).toBe(0);
  });

  it("bootstraps a fresh sqlite database without pre-existing catalog tables", async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "vibebasket-core-db-"));
    tempDirs.push(tempDir);

    const dbPath = path.join(tempDir, "fresh.db");
    const client = createClient({ url: `file:${dbPath}` });

    await ensureDatabaseSchema(client);

    const tables = await client.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name IN ('catalog_items', 'bundles', 'catalog_sync_runs', 'users', 'saved_stacks')
      ORDER BY name
    `);
    const tableNames = ((tables as SqlRowsResult<{ name?: unknown }>).rows ?? []).map(
      (row) => row.name,
    );

    expect(tableNames).toEqual([
      "bundles",
      "catalog_items",
      "catalog_sync_runs",
      "saved_stacks",
      "users",
    ]);

    await client.execute(`
      INSERT INTO users (id, name, email, created_at, updated_at)
      VALUES ('user-1', 'User 1', 'user1@example.com', 1710000000, 1710000000)
    `);
    await client.execute(`
      INSERT INTO saved_stacks (id, user_id, name, created_at, updated_at)
      VALUES ('stack-1', 'user-1', 'My Stack', 1710000000, 1710000000)
    `);
    await client.execute(`
      INSERT INTO saved_stack_items (
        id,
        stack_id,
        catalog_item_id,
        catalog_item_type,
        snapshot_display_name,
        position,
        created_at
      )
      VALUES ('item-1', 'stack-1', 'catalog-1', 'mcp', 'Catalog Item', 0, 1710000000)
    `);

    await expect(
      client.execute(`
      INSERT INTO saved_stacks (id, user_id, name, created_at, updated_at)
      VALUES ('stack-orphan', 'missing-user', 'Nope', 1710000000, 1710000000)
    `),
    ).rejects.toThrow();

    await client.execute("DELETE FROM users WHERE id = 'user-1'");

    const remainingStacks = await client.execute("SELECT COUNT(*) as count FROM saved_stacks");
    const remainingItems = await client.execute("SELECT COUNT(*) as count FROM saved_stack_items");

    expect((remainingStacks as SqlRowsResult<{ count?: unknown }>).rows?.[0]?.count).toBe(0);
    expect((remainingItems as SqlRowsResult<{ count?: unknown }>).rows?.[0]?.count).toBe(0);
  });

  it("fails with a clear error when duplicate legacy data blocks unique indexes", async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "vibebasket-core-db-"));
    tempDirs.push(tempDir);

    const dbPath = path.join(tempDir, "duplicates.db");
    const client = createClient({ url: `file:${dbPath}` });

    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT
      )
    `);
    await client.execute(`
      INSERT INTO users (id, name, email)
      VALUES
        ('user-1', 'User 1', 'duplicate@example.com'),
        ('user-2', 'User 2', 'duplicate@example.com')
    `);

    await expect(ensureDatabaseSchema(client)).rejects.toThrow(
      "Cannot enable users_email_unique because duplicate non-null user emails already exist.",
    );

    const foreignKeys = await client.execute("PRAGMA foreign_keys");
    expect((foreignKeys as SqlRowsResult<{ foreign_keys?: unknown }>).rows?.[0]?.foreign_keys).toBe(
      1,
    );

    const userColumns = await client.execute("PRAGMA table_info(users)");
    const userColumnNames = ((userColumns as SqlRowsResult<{ name?: unknown }>).rows ?? [])
      .map((row) => row.name)
      .sort();
    expect(userColumnNames).toEqual(["email", "id", "name"]);
  });

  it("fails early with a clear error when legacy verification tokens are duplicated", async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "vibebasket-core-db-"));
    tempDirs.push(tempDir);

    const dbPath = path.join(tempDir, "duplicate-verification-tokens.db");
    const client = createClient({ url: `file:${dbPath}` });

    await client.execute(`
      CREATE TABLE verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    await client.execute(`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES
        ('user-1', 'duplicate-token', 1710000000),
        ('user-2', 'duplicate-token', 1710000100)
    `);

    await expect(ensureDatabaseSchema(client)).rejects.toThrow(
      "Cannot enable verification_tokens_token_unique because duplicate verification tokens already exist.",
    );
  });
});
