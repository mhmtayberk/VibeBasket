import { NextResponse } from "next/server";
import { db, catalogItems } from "@vibebasket/core";

export async function GET() {
  try {
    const items = await db.select().from(catalogItems);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
