import { bundles, db } from "@vibebasket/core";
import { and, eq, lt, or, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { cleanupStaleData } from "@/lib/data-cleanup";
import {
	applySecurityHeaders,
	createTooManyRequestsResponse,
} from "@/lib/security-headers";

const BUNDLE_GET_RATE_LIMIT = 60;
const BUNDLE_GET_RATE_WINDOW_MS = 60 * 1000;

let lastCleanup = 0;

async function cleanupExpiredBundles() {
	const now = Date.now();
	if (now - lastCleanup < 60_000) return;
	lastCleanup = now;

	try {
		await db.delete(bundles).where(
			and(
				lt(bundles.expiresAt, new Date()),
				isNull(bundles.userId),
			),
		);
	} catch {
		// best-effort cleanup
	}
}

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

		const bundle = result[0];

		if (bundle.expiresAt && new Date(bundle.expiresAt) < new Date()) {
			try {
				await db.delete(bundles).where(eq(bundles.id, bundle.id));
			} catch { /* best-effort */ }
			return NextResponse.json({ error: "Bundle has expired" }, { status: 410 });
		}

		void cleanupExpiredBundles();
		void cleanupStaleData();

		return applySecurityHeaders(
			NextResponse.json(bundle.manifest, {
				headers: {
					"Cache-Control": bundle.userId
						? "public, max-age=3600"
						: "public, max-age=31536000, immutable",
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
