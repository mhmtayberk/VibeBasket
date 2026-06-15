import { describe, expect, it } from "vitest";
import { shouldGrantAdminRole } from "./admin-role";

describe("shouldGrantAdminRole", () => {
  it("requires verified email for production admins", () => {
    expect(
      shouldGrantAdminRole({
        adminEmails: ["owner@example.com"],
        email: "owner@example.com",
        emailVerified: null,
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
        nodeEnv: "production",
      }),
    ).toBe(true);
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
