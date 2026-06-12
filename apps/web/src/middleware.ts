import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
	"X-Frame-Options": "DENY",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

if (process.env.NODE_ENV === "production") {
	SECURITY_HEADERS["Content-Security-Policy"] =
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
}

const STATE_CHANGING_METHODS = new Set(["POST", "PATCH", "DELETE", "PUT"]);

function isValidOrigin(request: NextRequest): boolean {
	const origin = request.headers.get("origin");
	const host = request.headers.get("host");

	if (!origin) return true; // Same-origin requests from same domain may omit Origin
	if (!host) return false;

	try {
		const originUrl = new URL(origin);
		return originUrl.host === host;
	} catch {
		return false;
	}
}

export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(key, value);
	}

	if (STATE_CHANGING_METHODS.has(request.method)) {
		if (!isValidOrigin(request)) {
			return new NextResponse(
				JSON.stringify({ error: "Invalid origin" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
				},
			);
		}
	}

	return response;
}

export const config = {
	matcher: "/((?!_next/static|_next/image|favicon.ico|targets/).*)",
};
