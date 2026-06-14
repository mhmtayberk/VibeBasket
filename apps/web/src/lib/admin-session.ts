import { auth } from "@/auth";

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
  const session = await auth();

  if (!session || !session.user || session.user.role !== "admin") {
    throw new ForbiddenError();
  }

  return session.user;
}
