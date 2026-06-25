import { resolvePublicBaseUrl } from "./public-url";

export class InvalidOriginError extends Error {
  constructor(message = "Invalid request origin.") {
    super(message);
    this.name = "InvalidOriginError";
  }
}

function resolveAllowedOrigin(request: Request) {
  return resolvePublicBaseUrl({ requestUrl: request.url });
}

export function assertTrustedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin")?.trim();
  const allowedOrigin = resolveAllowedOrigin(request);

  if (!origin || origin !== allowedOrigin) {
    throw new InvalidOriginError();
  }
}
