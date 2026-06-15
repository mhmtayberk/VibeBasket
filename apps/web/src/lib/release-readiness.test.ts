import { describe, expect, it } from "vitest";
import { buildReleaseReadinessReport } from "./release-readiness";

describe("buildReleaseReadinessReport", () => {
  it("flags missing production auth and URL blockers", () => {
    const report = buildReleaseReadinessReport(
      {
        NODE_ENV: "production",
        AUTH_SECRET: "",
        NEXTAUTH_URL: "",
        AUTH_TRUST_HOST: "false",
        TRUST_PROXY: "false",
        CATALOG_REFRESH_TOKEN: "",
        DATABASE_URL: "file:/data/vibebasket.db",
      },
      {
        id: "local",
        configuredId: "local",
        isConfigured: true,
        isFallback: false,
        warning: null,
      },
    );

    expect(report.tone).toBe("critical");
    expect(report.blockers.map((item) => item.key)).toEqual(
      expect.arrayContaining(["auth-secret", "nextauth-url-missing"]),
    );
    expect(report.warnings.map((item) => item.key)).toEqual(
      expect.arrayContaining(["auth-trust-host", "trust-proxy", "oauth-none"]),
    );
  });

  it("surfaces incomplete enabled OAuth providers and storage fallback", () => {
    const report = buildReleaseReadinessReport(
      {
        NODE_ENV: "production",
        AUTH_SECRET: "secret",
        NEXTAUTH_URL: "https://vibebasket.dev",
        AUTH_TRUST_HOST: "true",
        TRUST_PROXY: "true",
        AUTH_GITHUB_ENABLED: "true",
        AUTH_GITHUB_ID: "client-id",
        AUTH_GITHUB_SECRET: "",
        DATABASE_URL: "postgres://prod-db",
      },
      {
        id: "local",
        configuredId: "s3",
        isConfigured: true,
        isFallback: true,
        warning: 'Configured backend "s3" is incomplete. Falling back to "local".',
      },
    );

    expect(report.blockers.map((item) => item.key)).toContain("storage-fallback");
    expect(report.warnings.map((item) => item.key)).toEqual(
      expect.arrayContaining(["oauth-github", "catalog-refresh-token", "database-url"]),
    );
  });

  it("reports healthy readiness when production essentials are configured", () => {
    const report = buildReleaseReadinessReport(
      {
        NODE_ENV: "production",
        AUTH_SECRET: "secret",
        NEXTAUTH_URL: "https://vibebasket.dev",
        AUTH_TRUST_HOST: "true",
        TRUST_PROXY: "true",
        CATALOG_REFRESH_TOKEN: "refresh-token",
        AUTH_GITHUB_ENABLED: "true",
        AUTH_GITHUB_ID: "client-id",
        AUTH_GITHUB_SECRET: "client-secret",
        DATABASE_URL: "file:/data/vibebasket.db",
      },
      {
        id: "s3",
        configuredId: "s3",
        isConfigured: true,
        isFallback: false,
        warning: null,
      },
    );

    expect(report.tone).toBe("healthy");
    expect(report.blockers).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);
    expect(report.checks.map((item) => item.key)).toEqual(
      expect.arrayContaining([
        "auth-secret",
        "nextauth-url",
        "auth-trust-host",
        "trust-proxy",
        "oauth-enabled",
        "catalog-refresh-token",
        "storage-backend",
        "database-url",
      ]),
    );
  });
});
