import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadSecurityHeadersModule(nodeEnv?: string) {
  if (nodeEnv) {
    vi.stubEnv("NODE_ENV", nodeEnv);
  }

  return import("./security-headers");
}

describe("Security Headers", () => {
  it("sets X-Content-Type-Options to nosniff", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets Referrer-Policy", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("sets X-Permitted-Cross-Domain-Policies to none", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe("none");
  });

  it("sets X-Download-Options to noopen", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Download-Options")).toBe("noopen");
  });

  it("does not override custom headers", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    res.headers.set("X-Custom", "custom-value");
    applySecurityHeaders(res);
    expect(res.headers.get("X-Custom")).toBe("custom-value");
  });

  it("applies to error responses too", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ error: "Not Found" }, { status: 404 });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.status).toBe(404);
  });

  it("applies to empty responses", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = new NextResponse(null, { status: 204 });
    applySecurityHeaders(res);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("applies to redirect responses", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.redirect("https://example.com");
    applySecurityHeaders(res);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.status).toBe(307);
  });

  it("all headers are non-empty strings", async () => {
    const { DEFAULT_SECURITY_HEADERS, applySecurityHeaders } =
      await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    for (const key of Object.keys(DEFAULT_SECURITY_HEADERS)) {
      const value = res.headers.get(key);
      if (!value) {
        continue;
      }

      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("no header contains unsafe characters", async () => {
    const { DEFAULT_SECURITY_HEADERS, applySecurityHeaders } =
      await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    for (const [key, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
      if (!value) {
        continue;
      }

      expect(value).not.toContain("\n");
      expect(value).not.toContain("\r");
      expect(value).not.toContain("<");
      expect(value).not.toContain(">");
    }
  });

  it("security headers are idempotent", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);
    applySecurityHeaders(res);
    applySecurityHeaders(res);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("omits CSP and HSTS outside production", async () => {
    const { applySecurityHeaders } = await loadSecurityHeadersModule("development");
    const res = NextResponse.json({ ok: true });
    applySecurityHeaders(res);

    expect(res.headers.has("Content-Security-Policy")).toBe(false);
    expect(res.headers.has("Strict-Transport-Security")).toBe(false);
  });

  it("includes hardened CSP and HSTS in production", async () => {
    const { DEFAULT_SECURITY_HEADERS: prodHeaders } = await loadSecurityHeadersModule("production");
    const csp = prodHeaders["Content-Security-Policy"];

    expect(prodHeaders["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("sets Retry-After on 429 responses when provided", async () => {
    const { createTooManyRequestsResponse } = await loadSecurityHeadersModule("development");
    const response = createTooManyRequestsResponse(60);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
