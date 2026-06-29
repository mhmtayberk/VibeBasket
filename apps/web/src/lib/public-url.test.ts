import { describe, expect, it } from "vitest";
import { resolvePublicBaseUrl } from "./public-url";

describe("resolvePublicBaseUrl", () => {
  it("prefers NEXTAUTH_URL when it is valid", () => {
    expect(
      resolvePublicBaseUrl({
        env: {
          NEXTAUTH_URL: "https://a.example.com/",
          NEXT_PUBLIC_SITE_URL: "https://b.example.com",
        },
      }),
    ).toBe("https://a.example.com");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL when NEXTAUTH_URL is invalid", () => {
    expect(
      resolvePublicBaseUrl({
        env: {
          NEXTAUTH_URL: "not-a-url",
          NEXT_PUBLIC_SITE_URL: "https://b.example.com/",
        },
      }),
    ).toBe("https://b.example.com");
  });

  it("uses the request origin when env values are absent", () => {
    expect(resolvePublicBaseUrl({ env: {}, requestUrl: "https://c.example.com/api/bundle" })).toBe(
      "https://c.example.com",
    );
  });

  it("prefers forwarded host and proto when provided at runtime", () => {
    expect(
      resolvePublicBaseUrl({
        env: {},
        requestUrl: "http://127.0.0.1:3000/sitemap.xml",
        forwardedHost: "vibebasket.dev",
        forwardedProto: "https",
      }),
    ).toBe("https://vibebasket.dev");
  });

  it("falls back to the request host when forwarded headers are absent", () => {
    expect(
      resolvePublicBaseUrl({
        env: {},
        requestUrl: "http://127.0.0.1:3000/robots.txt",
        host: "vibebasket.dev",
      }),
    ).toBe("https://vibebasket.dev");
  });

  it("uses deployment host envs when explicit public URLs are absent", () => {
    expect(
      resolvePublicBaseUrl({
        env: {
          NODE_ENV: "production",
          VERCEL_PROJECT_PRODUCTION_URL: "app.example.com",
        },
      }),
    ).toBe("https://app.example.com");
  });

  it("uses COOLIFY_FQDN when explicit public URLs are absent", () => {
    expect(
      resolvePublicBaseUrl({
        env: {
          COOLIFY_FQDN: "vibebasket.dev",
        },
      }),
    ).toBe("https://vibebasket.dev");
  });

  it("falls back to localhost instead of a hardcoded production domain", () => {
    expect(resolvePublicBaseUrl({ env: { NODE_ENV: "production" } })).toBe("http://localhost:3000");
  });
});
