import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";
import { catalogItems, db, eq } from "@vibebasket/core";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ITEM_RATE_LIMIT = 120;
const ITEM_RATE_WINDOW_MS = 60 * 1000;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const rateLimit = checkRateLimit(
    `catalog-item:${getClientAddress(request)}`,
    ITEM_RATE_LIMIT,
    ITEM_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const { id } = await context.params;
    const rows = await db
      .select({
        id: catalogItems.id,
        type: catalogItems.type,
        displayName: catalogItems.displayName,
        description: catalogItems.description,
        sourceName: catalogItems.sourceName,
        sourceUrl: catalogItems.sourceUrl,
        verified: catalogItems.verified,
        official: catalogItems.official,
        lastSyncedAt: catalogItems.lastSyncedAt,
        data: catalogItems.data,
      })
      .from(catalogItems)
      .where(eq(catalogItems.id, id))
      .limit(1);

    if (!rows[0]) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Catalog item not found." }, { status: 404 }),
      );
    }

    return applySecurityHeaders(NextResponse.json(rows[0]));
  } catch (error) {
    console.error("Failed to fetch catalog item:", error);
    return applySecurityHeaders(
      NextResponse.json({ error: "Failed to fetch catalog item." }, { status: 500 }),
    );
  }
}
