export function shouldRefreshSessionUser(
  email?: string | null,
  emailVerified?: Date | null,
  emailVerificationProvider?: string | null,
) {
  return !email || !(emailVerified instanceof Date) || !emailVerificationProvider;
}
