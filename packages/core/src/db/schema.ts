import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const catalogItems = sqliteTable("catalog_items", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'mcp' | 'skill' | 'rule' | 'workflow'
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  data: text("data", { mode: "json" }).notNull(), // Full McpEntry, SkillEntry, etc.
  verified: integer("verified", { mode: "boolean" }).default(false),
  firstSeenAt: integer("first_seen_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(), // nanoid or similar for short URLs
  manifest: text("manifest", { mode: "json" }).notNull(), // Full Bundle manifest
  userId: text("user_id"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const catalogSyncRuns = sqliteTable("catalog_sync_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trigger: text("trigger").notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  totalItems: integer("total_items").notNull(),
  mcps: integer("mcps").notNull(),
  skills: integer("skills").notNull(),
  rules: integer("rules").notNull(),
  workflows: integer("workflows").notNull(),
  durationMs: integer("duration_ms").notNull(),
  sourceErrors: text("source_errors", { mode: "json" }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

export const backupStorageConfig = sqliteTable("backup_storage_config", {
  id: text("id").primaryKey().default("default"),
  backend: text("backend").notNull().default("local"),
  encryptedConfig: text("encrypted_config"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const siteConfig = sqliteTable("site_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export * from "./auth-schema";
export * from "./stacks-schema";
