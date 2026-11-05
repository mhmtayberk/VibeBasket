import { describe, expect, it } from "vitest";
import { shouldGrantAdminRole } from "./admin-role";

describe("shouldGrantAdminRole", () => {
  it("requires verified email for production admins", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: ["owner@example.com"],
        email: "owner@example.com",
        emailVerified: null,
        emailVerificationProvider: null,
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("grants admin when allowlisted and verified", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: ["owner@example.com"],
        email: "Owner@example.com",
        emailVerified: new Date(),
        emailVerificationProvider: "google",
        nodeEnv: "production",
      }),
    ).toBe(true);
  });

  it("rejects legacy verified timestamps without provider evidence", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: ["owner@example.com"],
        email: "owner@example.com",
        emailVerified: new Date(),
        emailVerificationProvider: null,
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("rejects verification provenance from an untrusted provider", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: ["owner@example.com"],
        email: "owner@example.com",
        emailVerified: new Date(),
        emailVerificationProvider: "github",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("keeps the local dev admin escape hatch outside production", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: [],
        email: "admin@vibebasket.dev",
        emailVerified: null,
        nodeEnv: "development",
      }),
    ).toBe(true);
  });
});
