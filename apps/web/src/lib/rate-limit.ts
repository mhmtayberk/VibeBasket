import { createHash } from "node:crypto";

type BucketEntry = {
  timestamps: number[];
};

const CLEANUP_INTERVAL = 50; // every N checks
const CLEANUP_WINDOW_MS = 60_000; // 1 minute

const buckets = new Map<string, BucketEntry>();
let cleanupCounter = 0;

function cleanupExpiredBuckets(now: number) {
  cleanupCounter++;
  if (cleanupCounter < CLEANUP_INTERVAL) return;
  cleanupCounter = 0;

  for (const [key, entry] of buckets.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > now - CLEANUP_WINDOW_MS);
    if (entry.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first ? first : null;
}

function buildFallbackFingerprint(request: Request) {
  const fingerprintSource = [
    request.headers.get("user-agent") ?? "",
    request.headers.get("sec-ch-ua") ?? "",
    request.headers.get("accept-language") ?? "",
  ].join("|");

  if (!fingerprintSource.replace(/\|/g, "").trim()) {
    return "unknown-client";
  }

  return `fp:${createHash("sha256").update(fingerprintSource).digest("hex").slice(0, 16)}`;
}

export function getClientAddress(request: Request) {
  const trustProxyEnv = process.env.TRUST_PROXY;
  const isTrustProxyEnabled = trustProxyEnv === "true" || trustProxyEnv === "1";

  if (isTrustProxyEnabled) {
    const cfIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cfIp) {
      return cfIp;
    }

    const forwardedFor = firstHeaderValue(request.headers.get("x-forwarded-for"));
    if (forwardedFor) {
      return forwardedFor;
    }

    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) {
      return realIp;
    }
  }

  const bestEffortCfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (bestEffortCfIp) {
    return `best-effort:${bestEffortCfIp}`;
  }

  const bestEffortForwardedIp = firstHeaderValue(request.headers.get("x-forwarded-for"));
  if (bestEffortForwardedIp) {
    return `best-effort:${bestEffortForwardedIp}`;
  }

  const bestEffortRealIp = request.headers.get("x-real-ip")?.trim();
  if (bestEffortRealIp) {
    return `best-effort:${bestEffortRealIp}`;
  }

  return buildFallbackFingerprint(request);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  cleanupExpiredBuckets(now);

  let entry = buckets.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    buckets.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  const currentCount = entry.timestamps.length;

  if (currentCount >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  entry.timestamps.push(now);
  const nextCount = entry.timestamps.length;
  const resetAt = entry.timestamps[0] + windowMs;

  return {
    allowed: true,
    remaining: Math.max(0, limit - nextCount),
    resetAt,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitBuckets() {
  buckets.clear();
  cleanupCounter = 0;
}
