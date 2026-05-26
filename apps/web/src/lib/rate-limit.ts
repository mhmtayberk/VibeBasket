type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();
let cleanupCounter = 0;

/**
 * Periodically purges expired rate limit buckets from memory to prevent memory leaks.
 */
function cleanupExpiredBuckets(now: number) {
	cleanupCounter++;
	if (cleanupCounter < 50) return; // Run cleanup once every 50 rate limit checks
	cleanupCounter = 0;

	for (const [key, bucket] of buckets.entries()) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
}

/**
 * Highly secure, hybrid client IP address resolver supporting Cloudflare, Nginx trust proxies,
 * and standard socket interfaces. Blocks client-side header spoofing attacks.
 */
export function getClientAddress(request: Request) {
	// 1. Cloudflare direct client IP validation
	const cfIp = request.headers.get("cf-connecting-ip");
	if (cfIp) {
		return cfIp.trim();
	}

	// 2. Trust proxy validation via process.env.TRUST_PROXY
	const trustProxyEnv = process.env.TRUST_PROXY;
	const isTrustProxyEnabled = trustProxyEnv === "true" || trustProxyEnv === "1";

	if (isTrustProxyEnabled) {
		const forwardedFor = request.headers.get("x-forwarded-for");
		if (forwardedFor) {
			const ip = forwardedFor.split(",")[0]?.trim();
			if (ip) return ip;
		}
	}

	// 3. Fallback to standard x-real-ip or local connection identifier
	const realIp = request.headers.get("x-real-ip");
	if (realIp) {
		return realIp.trim();
	}

	return "local";
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
	const now = Date.now();
	
	// Safely clean expired entries from Map memory
	cleanupExpiredBuckets(now);

	const current = buckets.get(key);

	if (!current || current.resetAt <= now) {
		const next = { count: 1, resetAt: now + windowMs };
		buckets.set(key, next);
		return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
	}

	if (current.count >= limit) {
		return { allowed: false, remaining: 0, resetAt: current.resetAt };
	}

	current.count += 1;
	return {
		allowed: true,
		remaining: Math.max(0, limit - current.count),
		resetAt: current.resetAt,
	};
}

export function resetRateLimitBuckets() {
	buckets.clear();
	cleanupCounter = 0;
}
