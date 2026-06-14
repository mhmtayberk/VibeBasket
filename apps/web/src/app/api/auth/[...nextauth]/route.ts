import { handlers } from "@/auth";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";
import { ensureDatabaseSchema } from "@vibebasket/core";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
const AUTH_RATE_LIMIT = 60;
const AUTH_RATE_WINDOW_MS = 60 * 1000;

function checkAuthRateLimit(request: NextRequest) {
  return checkRateLimit(`auth:${getClientAddress(request)}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS);
}

export async function GET(request: NextRequest) {
  const rateLimit = checkAuthRateLimit(request);
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }

  await ensureDatabaseSchema();
  return applySecurityHeaders(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
  const rateLimit = checkAuthRateLimit(request);
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }

  await ensureDatabaseSchema();
  return applySecurityHeaders(await handlers.POST(request));
}
