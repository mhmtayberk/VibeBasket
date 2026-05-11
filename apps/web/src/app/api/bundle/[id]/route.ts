import { NextResponse } from "next/server";
import { db, bundles } from "@vibebasket/core";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(bundles).where(eq(bundles.id, id)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json(result[0].manifest);
  } catch (error) {
    console.error("Failed to fetch bundle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
