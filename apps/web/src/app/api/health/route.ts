import { db, users } from "@vibebasket/core";
import { sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

// Dynamic, secure and high-performance health check.
// Using inline variables for persistent cache during the node server lifecycle.
let lastDbCheck = 0;
let lastDbStatus = false;
const CACHE_TTL_MS = 5000; // 5-second threshold to safeguard DB from health probes flooding

async function checkDatabase(): Promise<boolean> {
	const now = Date.now();
	if (now - lastDbCheck < CACHE_TTL_MS) {
		return lastDbStatus;
	}

	try {
		// Standard, highly compatible Drizzle lightweight query on users table
		await db.select().from(users).limit(1);
		lastDbStatus = true;
		lastDbCheck = now;
		return true;
	} catch (error) {
		console.error("[Healthcheck Probe] Database connectivity failure:", error);
		lastDbStatus = false;
		lastDbCheck = now;
		return false;
	}
}

/**
 * Lightweight, security-hardened health check endpoint.
 * Validates process health and database availability.
 */
export async function GET(_req: NextRequest) {
	const isDbHealthy = await checkDatabase();

	const responsePayload = {
		status: isDbHealthy ? "ok" : "unhealthy",
		services: {
			database: isDbHealthy ? "healthy" : "unreachable",
		},
		uptime: Math.floor(process.uptime()),
		timestamp: Date.now(),
	};

	return Response.json(responsePayload, {
		status: isDbHealthy ? 200 : 503,
		headers: {
			"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
}

