import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export type AuthProviderId = "apple" | "github" | "google" | "microsoft-entra-id";

export type EnabledAuthProvider = {
  id: AuthProviderId;
  label: string;
};

export type AuthProviderReadiness = EnabledAuthProvider & {
  enabled: boolean;
  configured: boolean;
  missingEnv: string[];
};

type ProviderEnvKey =
  | "AUTH_APPLE_ENABLED"
  | "AUTH_APPLE_ID"
  | "AUTH_APPLE_SECRET"
  | "AUTH_TRUST_HOST"
  | "AUTH_GITHUB_ENABLED"
  | "AUTH_GITHUB_ID"
  | "AUTH_GITHUB_SECRET"
  | "AUTH_GOOGLE_ENABLED"
  | "AUTH_GOOGLE_ID"
  | "AUTH_GOOGLE_SECRET"
  | "AUTH_MICROSOFT_ENTRA_ID_ENABLED"
  | "AUTH_MICROSOFT_ENTRA_ID_ID"
  | "AUTH_MICROSOFT_ENTRA_ID_SECRET";

export type AuthProviderEnv = Partial<
  Record<
    | ProviderEnvKey
    | "AUTH_SECRET"
    | "AUTH_URL"
    | "NEXTAUTH_URL"
    | "NEXT_PUBLIC_SITE_URL"
    | "SITE_URL"
    | "NODE_ENV",
    string | undefined
  >
>;

type ProviderDefinition = {
  id: AuthProviderId;
  label: string;
  enabledFlag: Extract<ProviderEnvKey, `${string}_ENABLED`>;
  requiredEnv: readonly Extract<ProviderEnvKey, `${string}_ID` | `${string}_SECRET`>[];
  create: (env: AuthProviderEnv) => Provider;
};

const PROVIDER_DEFINITIONS: readonly ProviderDefinition[] = [
  {
    id: "github",
    label: "GitHub",
    enabledFlag: "AUTH_GITHUB_ENABLED",
    requiredEnv: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
    create: (env) =>
      GitHub({
        clientId: env.AUTH_GITHUB_ID ?? "",
        clientSecret: env.AUTH_GITHUB_SECRET ?? "",
      }),
  },
  {
    id: "google",
    label: "Google",
    enabledFlag: "AUTH_GOOGLE_ENABLED",
    requiredEnv: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
    create: (env) =>
      Google({
        clientId: env.AUTH_GOOGLE_ID ?? "",
        clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
      }),
  },
  {
    id: "apple",
    label: "Apple",
    enabledFlag: "AUTH_APPLE_ENABLED",
    requiredEnv: ["AUTH_APPLE_ID", "AUTH_APPLE_SECRET"],
    create: (env) =>
      Apple({
        clientId: env.AUTH_APPLE_ID ?? "",
        clientSecret: env.AUTH_APPLE_SECRET ?? "",
      }),
  },
  {
    id: "microsoft-entra-id",
    label: "Microsoft",
    enabledFlag: "AUTH_MICROSOFT_ENTRA_ID_ENABLED",
    requiredEnv: ["AUTH_MICROSOFT_ENTRA_ID_ID", "AUTH_MICROSOFT_ENTRA_ID_SECRET"],
    create: (env) =>
      MicrosoftEntraID({
        clientId: env.AUTH_MICROSOFT_ENTRA_ID_ID ?? "",
        clientSecret: env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? "",
      }),
  },
] as const;

function isEnabledFlagSet(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function hasConfiguredValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getAuthProviderReadiness(
  env: AuthProviderEnv = process.env,
): AuthProviderReadiness[] {
  return PROVIDER_DEFINITIONS.map((provider) => {
    const enabled = isEnabledFlagSet(env[provider.enabledFlag]);
    const missingEnv = provider.requiredEnv.filter((key) => !hasConfiguredValue(env[key]));

    return {
      id: provider.id,
      label: provider.label,
      enabled,
      configured: enabled && missingEnv.length === 0,
      missingEnv,
    };
  });
}

function getEnabledProviderDefinitions(env: AuthProviderEnv = process.env) {
  const readinessById = new Map(
    getAuthProviderReadiness(env).map((readiness) => [readiness.id, readiness]),
  );

  return PROVIDER_DEFINITIONS.filter(
    (provider) => readinessById.get(provider.id)?.configured === true,
  );
}

export function getEnabledAuthProviders(env: AuthProviderEnv = process.env): EnabledAuthProvider[] {
  return getEnabledProviderDefinitions(env).map(({ id, label }) => ({
    id,
    label,
  }));
}

export function createAuthProviders(env: AuthProviderEnv = process.env): Provider[] {
  return getEnabledProviderDefinitions(env).map((provider) => provider.create(env));
}

export function resolveAuthSecret(env: AuthProviderEnv = process.env) {
  if (env.AUTH_SECRET && env.AUTH_SECRET.trim().length > 0) {
    return env.AUTH_SECRET;
  }

  if (env.NODE_ENV !== "production") {
    return "vibebasket-dev-only-secret-change-me";
  }

  return undefined;
}

export function resolveTrustHost(env: AuthProviderEnv = process.env) {
  if (env.NODE_ENV !== "production") {
    return true;
  }

  if (env.AUTH_TRUST_HOST !== undefined) {
    return isEnabledFlagSet(env.AUTH_TRUST_HOST);
  }

  return (
    hasConfiguredValue(env.NEXTAUTH_URL) ||
    hasConfiguredValue(env.AUTH_URL) ||
    hasConfiguredValue(env.NEXT_PUBLIC_SITE_URL) ||
    hasConfiguredValue(env.SITE_URL)
  );
}

export const authConfig: NextAuthConfig = {
  providers: createAuthProviders(),
  session: {
    strategy: "database",
  },
  secret: resolveAuthSecret(),
  trustHost: resolveTrustHost(),
};
