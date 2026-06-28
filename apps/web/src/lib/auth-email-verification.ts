type ProviderProfile = Record<string, unknown> | null | undefined;

const TRUSTED_OAUTH_PROVIDERS = new Set(["google", "apple", "microsoft-entra-id"]);

function isTruthyStringBoolean(value: unknown) {
  return value === true || value === "true";
}

export function isTrustedOAuthProvider(provider: string | null | undefined) {
  if (!provider) {
    return false;
  }

  return TRUSTED_OAUTH_PROVIDERS.has(provider);
}

export function isTrustedOAuthEmailVerified(
  provider: string | null | undefined,
  profile: ProviderProfile,
) {
  if (!isTrustedOAuthProvider(provider) || !profile) {
    return false;
  }

  switch (provider) {
    case "google":
      return profile.email_verified === true;
    case "apple":
      return isTruthyStringBoolean(profile.email_verified);
    case "microsoft-entra-id":
      return profile.email_verified === true;
    default:
      return false;
  }
}
