import { describe, expect, it } from "vitest";
import { isTrustedOAuthEmailVerified, isTrustedOAuthProvider } from "./auth-email-verification";

describe("isTrustedOAuthProvider", () => {
  it("recognizes trusted OAuth providers", () => {
    expect(isTrustedOAuthProvider("google")).toBe(true);
    expect(isTrustedOAuthProvider("apple")).toBe(true);
    expect(isTrustedOAuthProvider("microsoft-entra-id")).toBe(true);
  });

  it("rejects providers without a trusted verified-email signal", () => {
    expect(isTrustedOAuthProvider("github")).toBe(false);
    expect(isTrustedOAuthProvider(undefined)).toBe(false);
  });
});

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
