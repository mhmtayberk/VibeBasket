import { db, users } from "@vibebasket/core";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";

const HEALTH_RATE_LIMIT = 120;
const HEALTH_RATE_WINDOW_MS = 60 * 1000;

let lastDbCheck = 0;
let lastDbStatus = false;
const CACHE_TTL_MS = 5000;

async function checkDatabase(): Promise<boolean> {
	const now = Date.now();
	if (now - lastDbCheck < CACHE_TTL_MS) {
		return lastDbStatus;
	}

	try {
		await db.select().from(users).limit(1);
		lastDbStatus = true;
	} catch (error) {
		console.error("[Health] DB check failed:", error);
		lastDbStatus = false;
	}
	lastDbCheck = now;
	return lastDbStatus;
}

export async function GET(req: NextRequest) {
	const rateLimit = checkRateLimit(
		`health:${getClientAddress(req)}`,
		HEALTH_RATE_LIMIT,
		HEALTH_RATE_WINDOW_MS,
	);
	if (!rateLimit.allowed) {
		return Response.json(
			{ error: "Too many requests" },
			{
				status: 429,
				headers: {
					"Retry-After": String(rateLimit.retryAfterSeconds),
					"Cache-Control": "no-store",
				},
			},
		);
	}

	const isDbHealthy = await checkDatabase();
	const payload = {
		status: isDbHealthy ? "ok" : "unhealthy",
		services: { database: isDbHealthy ? "healthy" : "unreachable" },
		uptime: Math.floor(process.uptime()),
		timestamp: Date.now(),
	};

	return Response.json(payload, {
		status: isDbHealthy ? 200 : 503,
		headers: {
			"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
}
