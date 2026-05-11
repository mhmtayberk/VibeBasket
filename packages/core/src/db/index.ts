import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "node:path";

export const client = createClient({ 
  url: process.env.DATABASE_URL || `file:${path.join(process.cwd(), "../../vibebasket.db")}` 
});

export const db = drizzle(client, { schema });
export * from "./schema";
