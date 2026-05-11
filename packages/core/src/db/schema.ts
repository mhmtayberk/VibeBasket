import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const catalogItems = sqliteTable("catalog_items", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'mcp' | 'skill' | 'rule' | 'workflow'
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  data: text("data", { mode: "json" }).notNull(), // Full McpEntry, SkillEntry, etc.
  verified: integer("verified", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(), // nanoid or similar for short URLs
  manifest: text("manifest", { mode: "json" }).notNull(), // Full Bundle manifest
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
