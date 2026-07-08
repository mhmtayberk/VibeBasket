import {
  buildDefaultLocaleRedirectPath,
  getLocaleFromPathname,
  shouldRedirectToDefaultLocale,
} from "@/i18n/locale-routing";
import {
  DEFAULT_SECURITY_HEADERS,
  createDocumentContentSecurityPolicy,
} from "@/lib/security-headers";
import { type NextRequest, NextResponse } from "next/server";

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
  const { pathname, search } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname) ?? "en";

  if (shouldRedirectToDefaultLocale(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = buildDefaultLocaleRedirectPath(pathname, "").replace(/\?.*$/, "");
    redirectUrl.search = search;

    return applyDocumentSecurityHeaders(NextResponse.redirect(redirectUrl, 308), nonce);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-locale", locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applyDocumentSecurityHeaders(response, nonce);
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/docs/:path*",
    "/login/:path*",
    "/stacks/:path*",
    "/:locale(en|tr|es|zh|hi)",
    "/:locale(en|tr|es|zh|hi)/:path*",
  ],
};
