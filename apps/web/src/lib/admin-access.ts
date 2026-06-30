export function shouldRenderAdminForbidden(error: unknown) {
  return error instanceof Error && error.name === "ForbiddenError";
}
