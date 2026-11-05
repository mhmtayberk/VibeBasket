import { isTrustedOAuthProvider } from "./auth-email-verification";

export interface AdminRoleEvaluationInput {
  adminEmails: string[];
  email?: string | null;
  emailVerified?: Date | null;
  emailVerificationProvider?: string | null;
  nodeEnv?: string;
}

export function shouldGrantAdminRole({
  adminEmails,
  email,
  emailVerified,
  emailVerificationProvider,
  nodeEnv,
}: AdminRoleEvaluationInput): boolean {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  const isDevAdmin = nodeEnv !== "production" && normalizedEmail === "admin@vibebasket.dev";
  if (isDevAdmin) {
    return true;
  }

  if (!(emailVerified instanceof Date) || !isTrustedOAuthProvider(emailVerificationProvider)) {
    return false;
  }

  return adminEmails.includes(normalizedEmail);
}
