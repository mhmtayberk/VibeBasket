import { createHash } from "node:crypto";

type BucketEntry = {
  timestamps: number[];
  expiresAt: number;
};

const CLEANUP_INTERVAL = 50; // every N checks
export const MAX_RATE_LIMIT_BUCKETS = 10_000;
const UNTRUSTED_GLOBAL_LIMIT_MULTIPLIER = 20;

const buckets = new Map<string, BucketEntry>();
let cleanupCounter = 0;

function cleanupExpiredBuckets(now: number) {
  cleanupCounter++;
  if (cleanupCounter < CLEANUP_INTERVAL) return;
  cleanupCounter = 0;

  for (const [key, entry] of buckets.entries()) {
    if (entry.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first ? first : null;
}

function buildFallbackFingerprint(request: Request) {
  const source = [
    request.headers.get("user-agent") ?? "",
    request.headers.get("sec-ch-ua") ?? "",
    request.headers.get("accept-language") ?? "",
  ].join("|");
  const normalized = source.replace(/\|/g, "").trim() ? source : "unknown-client";
  return `fp:${createHash("sha256").update(normalized).digest("hex").slice(0, 16)}`;
}

function trustedProxyAddress(request: Request) {
  switch (process.env.TRUST_PROXY_HEADER) {
    case "cf-connecting-ip":
      return request.headers.get("cf-connecting-ip")?.trim() || null;
    case "x-real-ip":
      return request.headers.get("x-real-ip")?.trim() || null;
    case undefined:
    case "":
    case "x-forwarded-for":
      return firstHeaderValue(request.headers.get("x-forwarded-for"));
    default:
      return null;
  }
}

function overflowBucketKey(key: string) {
  const separatorIndex = key.indexOf(":");
  const namespace = separatorIndex > 0 ? key.slice(0, separatorIndex) : "global";
  return `overflow:${namespace}`;
}

function boundedBucketKey(key: string) {
  if (buckets.has(key) || buckets.size < MAX_RATE_LIMIT_BUCKETS) {
    return key;
  }

  const overflowKey = overflowBucketKey(key);
  if (!buckets.has(overflowKey)) {
    let earliestExpiryKey: string | undefined;
    let earliestExpiry = Number.POSITIVE_INFINITY;
    for (const [candidateKey, entry] of buckets) {
      if (entry.expiresAt < earliestExpiry) {
        earliestExpiry = entry.expiresAt;
        earliestExpiryKey = candidateKey;
      }
    }
    if (earliestExpiryKey !== undefined) {
      buckets.delete(earliestExpiryKey);
    }
  }

  return overflowKey;
}

export function getClientAddress(request: Request) {
  const trustProxyEnv = process.env.TRUST_PROXY;
  const isTrustProxyEnabled = trustProxyEnv === "true" || trustProxyEnv === "1";

  if (isTrustProxyEnabled) {
    return trustedProxyAddress(request) ?? buildFallbackFingerprint(request);
  }

  return buildFallbackFingerprint(request);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  if (limit <= 0) {
    const resetAt = now + Math.max(0, windowMs);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }
  const windowStart = now - windowMs;

  const bucketKey = boundedBucketKey(key);
  let entry = buckets.get(bucketKey);

  if (!entry) {
    entry = { timestamps: [], expiresAt: now + windowMs };
    buckets.set(bucketKey, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  const currentCount = entry.timestamps.length;

  if (currentCount >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + windowMs;
    entry.expiresAt = entry.timestamps[entry.timestamps.length - 1] + windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  entry.timestamps.push(now);
  entry.expiresAt = now + windowMs;
  const nextCount = entry.timestamps.length;
  const resetAt = entry.timestamps[0] + windowMs;

  return {
    allowed: true,
    remaining: Math.max(0, limit - nextCount),
    resetAt,
    retryAfterSeconds: 0,
  };
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  if (key.includes(":fp:")) {
    const separatorIndex = key.indexOf(":");
    const namespace = separatorIndex > 0 ? key.slice(0, separatorIndex) : "global";
    const aggregate = consumeRateLimit(
      `aggregate:${namespace}`,
      Math.max(1, limit) * UNTRUSTED_GLOBAL_LIMIT_MULTIPLIER,
      windowMs,
      now,
    );
    if (!aggregate.allowed) {
      return aggregate;
    }
  }

  return consumeRateLimit(key, limit, windowMs, now);
}

export function resetRateLimitBuckets() {
  buckets.clear();
  cleanupCounter = 0;
}
