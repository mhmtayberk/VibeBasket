import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./auth-schema";

export const savedStacks = sqliteTable(
  "saved_stacks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userNameUnique: uniqueIndex("saved_stacks_user_name_unique").on(table.userId, table.name),
    userIdUpdatedAtIdx: index("saved_stacks_user_id_updated_at_idx").on(table.userId, table.updatedAt),
  })
);

export const savedStackItems = sqliteTable(
  "saved_stack_items",
  {
    id: text("id").primaryKey(),
    stackId: text("stack_id")
      .notNull()
      .references(() => savedStacks.id, { onDelete: "cascade" }),
    catalogItemId: text("catalog_item_id").notNull(),
    catalogItemType: text("catalog_item_type").notNull(),
    snapshotDisplayName: text("snapshot_display_name").notNull(),
    snapshotDescription: text("snapshot_description"),
    position: integer("position").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    stackIdPositionIdx: index("saved_stack_items_stack_id_position_idx").on(
      table.stackId,
      table.position
    ),
  })
);

export const savedStackTargets = sqliteTable(
  "saved_stack_targets",
  {
    id: text("id").primaryKey(),
    stackId: text("stack_id")
      .notNull()
      .references(() => savedStacks.id, { onDelete: "cascade" }),
    targetId: text("target_id").notNull(),
    position: integer("position").notNull(),
  },
  (table) => ({
    stackIdPositionIdx: index("saved_stack_targets_stack_id_position_idx").on(
      table.stackId,
      table.position
    ),
  })
);
