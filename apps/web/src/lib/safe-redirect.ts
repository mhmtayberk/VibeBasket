export function sanitizeCallbackUrl(value: string | undefined, fallback = "/") {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}
