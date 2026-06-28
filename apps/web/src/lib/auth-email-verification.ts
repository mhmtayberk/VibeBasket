type ProviderProfile = Record<string, unknown> | null | undefined;

function isTruthyStringBoolean(value: unknown) {
  return value === true || value === "true";
}

export function isTrustedOAuthEmailVerified(
  provider: string | null | undefined,
  profile: ProviderProfile,
) {
  if (!provider || !profile) {
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
