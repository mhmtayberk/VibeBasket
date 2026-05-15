import { NextResponse } from "next/server";
import { db, bundles, catalogItems, BundleSchema, SCHEMA_VERSION } from "@vibebasket/core";
import { nanoid } from "nanoid";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { SUPPORTED_TARGET_IDS } from "@/lib/targets";

type Bundle = z.infer<typeof BundleSchema>;

export async function POST(req: Request) {
  try {
    // Security: Limit bundle size to 100KB
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 100 * 1024) {
      return NextResponse.json({ error: "Bundle too large (max 100KB)" }, { status: 413 });
    }

    const body = await req.json();
    const { targets, scope, itemIds } = body;

    if (!targets || !scope || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const unsupportedTargets = targets.filter((target: string) => !SUPPORTED_TARGET_IDS.includes(target));
    if (unsupportedTargets.length > 0) {
      return NextResponse.json(
        { error: `Unsupported bundle targets: ${unsupportedTargets.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch items from DB
    const selectedItems = await db.select().from(catalogItems).where(inArray(catalogItems.id, itemIds));

    // Construct manifest
    const manifest: Bundle = {
      schemaVersion: SCHEMA_VERSION,
      scope,
      targets,
      mcps: selectedItems.filter(i => i.type === 'mcp').map(i => i.data as any),
      skills: selectedItems.filter(i => i.type === 'skill').map(i => i.data as any),
      rules: selectedItems.filter(i => i.type === 'rule').map(i => i.data as any),
      workflowPacks: selectedItems.filter(i => i.type === 'workflow').map(i => i.data as any),
    };

    // Validate
    const validated = BundleSchema.parse(manifest);

    // Save
    const id = nanoid(10);
    await db.insert(bundles).values({
      id,
      manifest: validated,
    });

    const origin = new URL(req.url).origin;
    return NextResponse.json({ id, url: `${origin}/api/bundle/${id}` });
  } catch (error: any) {
    console.error("Failed to create bundle:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
