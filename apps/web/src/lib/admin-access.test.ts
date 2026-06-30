import { describe, expect, it } from "vitest";
import { shouldRenderAdminForbidden } from "./admin-access";

describe("shouldRenderAdminForbidden", () => {
  it("returns true for ForbiddenError", () => {
    const error = new Error("forbidden");
    error.name = "ForbiddenError";
    expect(shouldRenderAdminForbidden(error)).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(shouldRenderAdminForbidden(new Error("boom"))).toBe(false);
  });
});
