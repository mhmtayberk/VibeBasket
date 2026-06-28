export function shouldRefreshSessionUser(email?: string | null, emailVerified?: Date | null) {
  return !email || !(emailVerified instanceof Date);
}
