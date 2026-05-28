import { bundles, db } from "@vibebasket/core";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import {
	applySecurityHeaders,
	createTooManyRequestsResponse,
} from "@/lib/security-headers";

const BUNDLE_GET_RATE_LIMIT = 60;
const BUNDLE_GET_RATE_WINDOW_MS = 60 * 1000;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const rateLimit = checkRateLimit(
		`bundle-get:${getClientAddress(request)}`,
		BUNDLE_GET_RATE_LIMIT,
		BUNDLE_GET_RATE_WINDOW_MS,
	);
	if (!rateLimit.allowed) {
		return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
	}
	try {
		const { id } = await params;
		const result = await db
			.select()
			.from(bundles)
			.where(eq(bundles.id, id))
			.limit(1);

		if (result.length === 0) {
			return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
		}

		return applySecurityHeaders(
			NextResponse.json(result[0].manifest, {
				headers: {
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			}),
		);
	} catch (error) {
		console.error("Failed to fetch bundle:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
