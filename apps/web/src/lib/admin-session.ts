import { InvalidOriginError, assertTrustedMutationOrigin } from "@/lib/csrf";
import { NextResponse } from "next/server";

async function loadAuth() {
  return (await import("@/auth")).auth;
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden: Admin access required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Strict server-side guard to assert that the current session belongs to a verified administrator.
 * Throws a ForbiddenError if unauthorized, which can be caught in route handlers or server actions.
 */
export async function requireAdminRole() {
  const auth = await loadAuth();
  const session = await auth();

  if (!session || !session.user || session.user.role !== "admin") {
    throw new ForbiddenError();
  }

  return session.user;
}

export async function requireAdminMutation(request: Request) {
  assertTrustedMutationOrigin(request);
  return requireAdminRole();
}

export function createAdminForbiddenResponse(error: unknown) {
  if (error instanceof ForbiddenError || error instanceof InvalidOriginError) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  return null;
}
