import { NextResponse } from "next/server";
import { db, catalogItems, like, or, and, eq } from "@vibebasket/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q");
  const type = searchParams.get("type"); // optional: mcp, skill, rule
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  try {
    let query = db.select().from(catalogItems);
    
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(catalogItems.displayName, `%${search}%`),
          like(catalogItems.description, `%${search}%`)
        )
      );
    }
    if (type) {
      conditions.push(eq(catalogItems.type, type));
    }

    const items = await db
      .select()
      .from(catalogItems)
      .where(conditions.length > 0 ? and(...(conditions as any)) : undefined)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
