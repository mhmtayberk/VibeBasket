import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_SECURITY_HEADERS,
  createDocumentContentSecurityPolicy,
} from "@/lib/security-headers";

function applyDocumentSecurityHeaders(response: NextResponse, nonce: string) {
  for (const [key, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    if (value) {
      response.headers.set(key, value);
    }
  }

  response.headers.set("Content-Security-Policy", createDocumentContentSecurityPolicy(nonce));
  return response;
}

function generateNonce() {
  return btoa(crypto.randomUUID()).replaceAll("=", "");
}

export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applyDocumentSecurityHeaders(response, nonce);
}

export const config = {
  matcher: ["/", "/admin/:path*", "/docs/:path*", "/login/:path*", "/stacks/:path*"],
};
