type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getClientAddress(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() || "unknown";
	}

	return request.headers.get("x-real-ip") || "local";
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
	const now = Date.now();
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
}
