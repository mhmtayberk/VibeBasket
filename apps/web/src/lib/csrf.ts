export class InvalidOriginError extends Error {
  constructor(message = "Invalid request origin.") {
    super(message);
    this.name = "InvalidOriginError";
  }
}

function resolveAllowedOrigin(request: Request) {
  const configuredOrigin = process.env.NEXTAUTH_URL?.trim();

  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {}
  }

  return new URL(request.url).origin;
}

export function assertTrustedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin")?.trim();
  const allowedOrigin = resolveAllowedOrigin(request);

  if (!origin || origin !== allowedOrigin) {
    throw new InvalidOriginError();
  }
}
