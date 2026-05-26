import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	checkRateLimit,
	getClientAddress,
	resetRateLimitBuckets,
} from "./rate-limit";

describe("rate-limit utilities", () => {
	beforeEach(() => {
		resetRateLimitBuckets();
		vi.unstubAllEnvs();
	});

	describe("getClientAddress resolution", () => {
		it("should prioritize cf-connecting-ip if present", () => {
			const req = new Request("https://vibebasket.dev/", {
				headers: {
					"cf-connecting-ip": "203.0.113.195",
					"x-forwarded-for": "198.51.100.42",
					"x-real-ip": "198.51.100.1",
				},
			});

			const ip = getClientAddress(req);
			expect(ip).toBe("203.0.113.195");
		});

		it("should ignore x-forwarded-for by default to prevent client-side spoofing", () => {
			const req = new Request("https://vibebasket.dev/", {
				headers: {
					"x-forwarded-for": "198.51.100.42",
					"x-real-ip": "198.51.100.1",
				},
			});

			const ip = getClientAddress(req);
			// Should ignore x-forwarded-for and fallback to x-real-ip
			expect(ip).toBe("198.51.100.1");
		});

		it("should trust x-forwarded-for when TRUST_PROXY env is enabled", () => {
			vi.stubEnv("TRUST_PROXY", "true");

			const req = new Request("https://vibebasket.dev/", {
				headers: {
					"x-forwarded-for": "198.51.100.42, 192.168.1.1",
					"x-real-ip": "198.51.100.1",
				},
			});

			const ip = getClientAddress(req);
			// TRUST_PROXY is enabled, so it parses first IP in list
			expect(ip).toBe("198.51.100.42");
		});

		it("should fallback to local connection identifier when no headers match", () => {
			const req = new Request("https://vibebasket.dev/");
			const ip = getClientAddress(req);
			expect(ip).toBe("local");
		});
	});

	describe("checkRateLimit & memory leak cleanup", () => {
		it("should allow requests within limits and block beyond limits", () => {
			const key = "test-client";
			const limit = 3;
			const windowMs = 5000;

			// First request
			let res = checkRateLimit(key, limit, windowMs);
			expect(res.allowed).toBe(true);
			expect(res.remaining).toBe(2);

			// Second request
			res = checkRateLimit(key, limit, windowMs);
			expect(res.allowed).toBe(true);
			expect(res.remaining).toBe(1);

			// Third request
			res = checkRateLimit(key, limit, windowMs);
			expect(res.allowed).toBe(true);
			expect(res.remaining).toBe(0);

			// Fourth request should be blocked
			res = checkRateLimit(key, limit, windowMs);
			expect(res.allowed).toBe(false);
			expect(res.remaining).toBe(0);
		});

		it("should cleanup expired entries from map under active load", () => {
			const windowMs = 10;
			const key = "temp-client";

			// Insert a rate-limit bucket
			checkRateLimit(key, 5, windowMs);

			// Mock time travel to simulate expiration
			const originalNow = Date.now;
			Date.now = () => originalNow() + 1000;

			// Trigger 55 requests to force rate limit checks and trigger map cleaner
			for (let i = 0; i < 55; i++) {
				checkRateLimit(`dummy-client-${i}`, 100, 10000);
			}

			// Restore original time resolver
			Date.now = originalNow;
		});
	});
});
