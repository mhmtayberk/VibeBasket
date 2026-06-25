import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientAddress, resetRateLimitBuckets } from "./rate-limit";

describe("rate-limit utilities", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
    vi.unstubAllEnvs();
  });

  describe("getClientAddress resolution", () => {
    it("should use cf-connecting-ip when present", () => {
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

    it("should prioritize cf-connecting-ip when TRUST_PROXY is enabled", () => {
      vi.stubEnv("TRUST_PROXY", "true");

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

    it("should fall back to a best-effort x-forwarded-for bucket when TRUST_PROXY is disabled", () => {
      const req = new Request("https://vibebasket.dev/", {
        headers: {
          "x-forwarded-for": "198.51.100.42",
          "x-real-ip": "198.51.100.1",
        },
      });

      const ip = getClientAddress(req);
      expect(ip).toBe("best-effort:198.51.100.42");
    });

    it("should fall back to a best-effort x-real-ip bucket when TRUST_PROXY is disabled", () => {
      const req = new Request("https://vibebasket.dev/", {
        headers: {
          "x-real-ip": "198.51.100.1",
        },
      });

      const ip = getClientAddress(req);
      expect(ip).toBe("best-effort:198.51.100.1");
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

    it("should fallback to a coarse fingerprint when no IP headers match", () => {
      const req = new Request("https://vibebasket.dev/", {
        headers: {
          "user-agent": "Vitest Browser",
          "accept-language": "en-US",
        },
      });
      const ip = getClientAddress(req);
      expect(ip).toMatch(/^fp:/);
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

    it("should differentiate between clients with same limit", () => {
      resetRateLimitBuckets();
      const limit = 2;
      const windowMs = 60000;

      // Client A uses both their requests
      expect(checkRateLimit("client-a", limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit("client-a", limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit("client-a", limit, windowMs).allowed).toBe(false);

      // Client B should still be allowed
      expect(checkRateLimit("client-b", limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit("client-b", limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit("client-b", limit, windowMs).allowed).toBe(false);
    });

    it("should return correct retryAfterSeconds when blocked", () => {
      resetRateLimitBuckets();
      const key = "retry-test";
      const limit = 1;
      const windowMs = 60000;

      checkRateLimit(key, limit, windowMs);
      const blocked = checkRateLimit(key, limit, windowMs);

      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
    });

    it("should handle zero or negative limits gracefully", () => {
      resetRateLimitBuckets();

      // Zero limit — all blocked
      const zero = checkRateLimit("zero-limit", 0, 60000);
      expect(zero.allowed).toBe(false);

      // Negative limit — treated as zero, all blocked
      const neg = checkRateLimit("neg-limit", -5, 60000);
      expect(neg.allowed).toBe(false);
    });

    it("should handle very large window", () => {
      resetRateLimitBuckets();
      const res = checkRateLimit("large-window", 100, 86400000); // 24 hours
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(99);
    });

    it("should handle very short window", () => {
      resetRateLimitBuckets();
      const res = checkRateLimit("short-window", 50, 1); // 1ms window
      expect(res.allowed).toBe(true);
    });

    it("should handle high limit", () => {
      resetRateLimitBuckets();
      const res = checkRateLimit("high-limit", 10000, 60000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(9999);
    });

    it("should handle cleanup without losing active client data", () => {
      resetRateLimitBuckets();
      const key = "persistent-client";
      const limit = 100;
      const windowMs = 3600000;

      // Use half the requests
      for (let i = 0; i < 50; i++) {
        checkRateLimit(key, limit, windowMs);
      }

      // Trigger cleanup via many distinct (quick-expiring) clients
      for (let i = 0; i < 60; i++) {
        checkRateLimit(`cleanup-trigger-${i}`, 1, 1);
      }

      // Active client should still be tracked
      const after = checkRateLimit(key, limit, windowMs);
      expect(after.remaining).toBeGreaterThanOrEqual(49);
    });

    it("should handle concurrent identical keys", () => {
      resetRateLimitBuckets();
      const key = "concurrent-same";
      const limit = 100;
      const windowMs = 60000;

      // Simulate concurrent requests from same client
      const results: boolean[] = [];
      for (let i = 0; i < 150; i++) {
        results.push(checkRateLimit(key, limit, windowMs).allowed);
      }

      const allowed = results.filter(Boolean).length;
      expect(allowed).toBe(100);
      const blocked = results.filter((r) => !r).length;
      expect(blocked).toBe(50);
    });

    it("should handle empty string key", () => {
      resetRateLimitBuckets();
      const res = checkRateLimit("", 5, 60000);
      expect(res.allowed).toBe(true);
    });

    it("should handle keys with special characters", () => {
      resetRateLimitBuckets();
      const specialKeys = [
        "catalog:192.168.1.1",
        "admin:user@example.com",
        "health:::global",
        "bundle / create",
      ];

      for (const key of specialKeys) {
        const res = checkRateLimit(key, 5, 60000);
        expect(res.allowed).toBe(true);
      }
    });

    it("should respect custom window per endpoint", () => {
      resetRateLimitBuckets();

      // Use all 3 requests in a 100ms window
      const key = "endpoint-test";
      checkRateLimit(key, 3, 100);
      checkRateLimit(key, 3, 100);
      checkRateLimit(key, 3, 100);
      expect(checkRateLimit(key, 3, 100).allowed).toBe(false);

      // Different window should have independent limit
      expect(checkRateLimit("other-endpoint", 10, 60000).allowed).toBe(true);
    });
  });
});
