import { ensureDatabaseSchema } from "@vibebasket/core";
import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import {
	applySecurityHeaders,
	createTooManyRequestsResponse,
} from "@/lib/security-headers";

export const runtime = "nodejs";
const AUTH_RATE_LIMIT = 60;
const AUTH_RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(request: NextRequest) {
	const result = checkRateLimit(
		`auth:${getClientAddress(request)}`,
		AUTH_RATE_LIMIT,
		AUTH_RATE_WINDOW_MS,
	);
	return !result.allowed;
}

export async function GET(request: NextRequest) {
	if (isRateLimited(request)) {
		return createTooManyRequestsResponse();
	}

	await ensureDatabaseSchema();
	return applySecurityHeaders(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
	if (isRateLimited(request)) {
		return createTooManyRequestsResponse();
	}

	await ensureDatabaseSchema();
	return applySecurityHeaders(await handlers.POST(request));
}
