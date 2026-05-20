import { auth } from "@/auth";

export class SessionRequiredError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "SessionRequiredError";
  }
}

export async function getCurrentSession() {
  return auth();
}

export async function requireCurrentSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new SessionRequiredError();
  }

  return session;
}

export async function requireCurrentUserId() {
  const session = await requireCurrentSession();
  const userId = session.user?.id;

  if (!userId) {
    throw new SessionRequiredError();
  }

  return userId;
}
