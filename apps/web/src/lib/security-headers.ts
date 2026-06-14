import { NextResponse } from "next/server";

export const DEFAULT_SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-Download-Options": "noopen",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security":
    process.env.NODE_ENV === "production" ? "max-age=63072000; includeSubDomains; preload" : "",
  "Content-Security-Policy":
    process.env.NODE_ENV === "production"
      ? [
          "default-src 'self'",
          "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ")
      : "",
} as const;

export function applySecurityHeaders(response: Response) {
  for (const [key, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    if (value) {
      response.headers.set(key, value);
    }
  }

  return response;
}

export function createTooManyRequestsResponse(retryAfterSeconds?: number) {
  const response = applySecurityHeaders(
    NextResponse.json({ error: "Too many requests" }, { status: 429 }),
  );
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    response.headers.set("Retry-After", String(retryAfterSeconds));
  }
  return response;
}
