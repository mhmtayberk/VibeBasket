import { auth } from "@/auth";

function isPublicSessionFailure(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "MissingSecret" ||
    error.name === "UntrustedHost" ||
    /\bMissingSecret\b|\bUntrustedHost\b/i.test(error.message)
  );
}

export async function getOptionalSession(context: string) {
  try {
    return await auth();
  } catch (error) {
    if (isPublicSessionFailure(error)) {
      console.warn(`[auth] optional session failed in ${context}:`, error);
      return null;
    }

    throw error;
  }
}
