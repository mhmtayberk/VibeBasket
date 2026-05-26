import { NextResponse } from "next/server";

export const DEFAULT_SECURITY_HEADERS = {
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

export function applySecurityHeaders(response: Response) {
	for (const [key, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
		response.headers.set(key, value);
	}

	return response;
}

export function createTooManyRequestsResponse() {
	return applySecurityHeaders(
		NextResponse.json({ error: "Too many requests" }, { status: 429 }),
	);
}
