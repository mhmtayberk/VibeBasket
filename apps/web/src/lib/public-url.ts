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

function normalizeForwardedHost(value: string | undefined): string | null {
  const firstHost = value?.split(",")[0]?.trim();
  if (!firstHost) {
    return null;
  }

  return normalizeHostToUrl(firstHost);
}

function normalizeRequestOrigin(options: {
  requestUrl?: string;
  forwardedHost?: string;
  forwardedProto?: string;
  host?: string;
}) {
  const forwardedHost = options.forwardedHost?.split(",")[0]?.trim();
  const forwardedProto = options.forwardedProto?.split(",")[0]?.trim().toLowerCase();

  if (forwardedHost) {
    const protocol =
      forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
    return normalizeBaseUrl(`${protocol}://${forwardedHost}`);
  }

  if (options.host?.trim()) {
    const inferredProtocol = /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(options.host)
      ? "http"
      : "https";
    return normalizeBaseUrl(`${inferredProtocol}://${options.host.trim()}`);
  }

  return normalizeBaseUrl(options.requestUrl);
}

export function resolvePublicBaseUrl(
  options: {
    env?: Partial<NodeJS.ProcessEnv>;
    requestUrl?: string;
    forwardedHost?: string;
    forwardedProto?: string;
    host?: string;
  } = {},
) {
  const env = options.env ?? process.env;

  return (
    normalizeBaseUrl(env.NEXTAUTH_URL) ??
    normalizeBaseUrl(env.NEXT_PUBLIC_SITE_URL) ??
    normalizeBaseUrl(env.SITE_URL) ??
    normalizeHostToUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeHostToUrl(env.VERCEL_URL) ??
    normalizeForwardedHost(env.COOLIFY_FQDN) ??
    normalizeRequestOrigin(options) ??
    DEFAULT_DEVELOPMENT_URL
  );
}
