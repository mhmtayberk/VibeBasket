import { describe, expect, it } from "vitest";
import { isTrustedOAuthEmailVerified } from "./auth-email-verification";

describe("isTrustedOAuthEmailVerified", () => {
  it("accepts verified Google profiles", () => {
    expect(
      isTrustedOAuthEmailVerified("google", {
        email: "owner@example.com",
        email_verified: true,
      }),
    ).toBe(true);
  });

  it("accepts verified Apple profiles with string booleans", () => {
    expect(
      isTrustedOAuthEmailVerified("apple", {
        email: "owner@example.com",
        email_verified: "true",
      }),
    ).toBe(true);
  });

  it("rejects providers without an explicit verified-email signal", () => {
    expect(
      isTrustedOAuthEmailVerified("github", {
        email: "owner@example.com",
      }),
    ).toBe(false);
  });

  it("rejects unverified Google profiles", () => {
    expect(
      isTrustedOAuthEmailVerified("google", {
        email: "owner@example.com",
        email_verified: false,
      }),
    ).toBe(false);
  });
});
