import { describe, expect, it } from "vitest";
import { resolveAdminEmails } from "./site-config";

describe("resolveAdminEmails", () => {
  it("merges database and environment values", () => {
    expect(
      resolveAdminEmails({
        databaseValue: "owner@example.com,team@example.com",
        envValue: "mayberk71@gmail.com,owner@example.com",
      }),
    ).toEqual(["owner@example.com", "team@example.com", "mayberk71@gmail.com"]);
  });

  it("normalizes casing and drops blank entries", () => {
    expect(
      resolveAdminEmails({
        databaseValue: " Owner@Example.com ,, ",
        envValue: "  ",
      }),
    ).toEqual(["owner@example.com"]);
  });
});
