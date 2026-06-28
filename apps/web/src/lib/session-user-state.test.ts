import { describe, expect, it } from "vitest";
import { shouldRefreshSessionUser } from "./session-user-state";

describe("shouldRefreshSessionUser", () => {
  it("refreshes when email is missing", () => {
    expect(shouldRefreshSessionUser(undefined, new Date())).toBe(true);
  });

  it("refreshes when email verification is null", () => {
    expect(shouldRefreshSessionUser("owner@example.com", null)).toBe(true);
  });

  it("refreshes when email verification is undefined", () => {
    expect(shouldRefreshSessionUser("owner@example.com", undefined)).toBe(true);
  });

  it("does not refresh when email and verified date are present", () => {
    expect(shouldRefreshSessionUser("owner@example.com", new Date())).toBe(false);
  });
});
