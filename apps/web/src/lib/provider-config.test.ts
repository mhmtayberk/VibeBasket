import { describe, expect, it } from "vitest";
import { createAuthProviders, getEnabledAuthProviders } from "../auth.config";

describe("auth provider configuration", () => {
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
});
