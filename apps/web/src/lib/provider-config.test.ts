import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAuthProviders,
  getAuthProviderReadiness,
  getEnabledAuthProviders,
  resolveTrustHost,
} from "../auth.config";

describe("auth provider configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns only enabled and fully configured providers", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_GITHUB_ENABLED: "true",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-secret",
      AUTH_GOOGLE_ENABLED: "1",
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-secret",
      AUTH_APPLE_ENABLED: "true",
      AUTH_APPLE_ID: "apple-client-id",
    } as const;

    expect(getEnabledAuthProviders(env)).toEqual([
      { id: "github", label: "GitHub" },
      { id: "google", label: "Google" },
    ]);
  });

  it("treats disabled flags and blank secrets as unavailable", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_GITHUB_ENABLED: "false",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-secret",
      AUTH_GOOGLE_ENABLED: "true",
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "   ",
      AUTH_APPLE_ENABLED: "yes",
      AUTH_APPLE_ID: "apple-client-id",
      AUTH_APPLE_SECRET: "apple-secret",
    } as const;

    expect(getEnabledAuthProviders(env)).toEqual([{ id: "apple", label: "Apple" }]);
  });

  it("builds provider instances in the same order as the enabled metadata", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_GITHUB_ENABLED: "on",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-secret",
      AUTH_GOOGLE_ENABLED: "true",
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-secret",
    } as const;

    const providers = createAuthProviders(env);
    const providerIds = providers.map((provider) => String((provider as { id: string }).id));

    expect(providerIds).toEqual(["github", "google"]);
  });

  it("enables Microsoft Entra ID when configured", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_MICROSOFT_ENTRA_ID_ENABLED: "true",
      AUTH_MICROSOFT_ENTRA_ID_ID: "ms-client-id",
      AUTH_MICROSOFT_ENTRA_ID_SECRET: "ms-secret",
    } as const;

    expect(getEnabledAuthProviders(env)).toEqual([
      { id: "microsoft-entra-id", label: "Microsoft" },
    ]);
  });

  it("excludes Microsoft when secret is missing", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_MICROSOFT_ENTRA_ID_ENABLED: "true",
      AUTH_MICROSOFT_ENTRA_ID_ID: "ms-client-id",
      AUTH_MICROSOFT_ENTRA_ID_SECRET: "",
    } as const;

    expect(getEnabledAuthProviders(env)).toEqual([]);
  });

  it("reports provider readiness with missing environment variables", () => {
    const env = {
      NODE_ENV: "test",
      AUTH_GITHUB_ENABLED: "true",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "",
      AUTH_GOOGLE_ENABLED: "false",
      AUTH_GOOGLE_ID: "",
      AUTH_GOOGLE_SECRET: "",
    } as const;

    expect(getAuthProviderReadiness(env)).toEqual(
      expect.arrayContaining([
        {
          id: "github",
          label: "GitHub",
          enabled: true,
          configured: false,
          missingEnv: ["AUTH_GITHUB_SECRET"],
        },
      ]),
    );
  });

  it("trusts the host in production when NEXTAUTH_URL is configured", () => {
    expect(
      resolveTrustHost({
        NODE_ENV: "production",
        NEXTAUTH_URL: "https://vibebasket.dev",
      }),
    ).toBe(true);
  });

  it("still respects an explicit AUTH_TRUST_HOST=false in production", () => {
    expect(
      resolveTrustHost({
        NODE_ENV: "production",
        NEXTAUTH_URL: "https://vibebasket.dev",
        AUTH_TRUST_HOST: "false",
      }),
    ).toBe(false);
  });
});
