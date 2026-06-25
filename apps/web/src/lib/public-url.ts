const DEFAULT_DEVELOPMENT_URL = "http://localhost:3000";

function normalizeHostToUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const normalized =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(normalized);
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function resolvePublicBaseUrl(
  options: {
    env?: Partial<NodeJS.ProcessEnv>;
    requestUrl?: string;
  } = {},
) {
  const env = options.env ?? process.env;

  return (
    normalizeBaseUrl(env.NEXTAUTH_URL) ??
    normalizeBaseUrl(env.NEXT_PUBLIC_SITE_URL) ??
    normalizeBaseUrl(env.SITE_URL) ??
    normalizeHostToUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeHostToUrl(env.VERCEL_URL) ??
    normalizeBaseUrl(options.requestUrl) ??
    DEFAULT_DEVELOPMENT_URL
  );
}
