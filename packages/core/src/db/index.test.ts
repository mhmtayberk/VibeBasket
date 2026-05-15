import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./index";

describe("resolveDatabaseUrl", () => {
  it("prefers DATABASE_URL when provided", () => {
    expect(resolveDatabaseUrl({
      cwd: "/tmp/project",
      env: { DATABASE_URL: "file:/tmp/custom.db" },
    })).toBe("file:/tmp/custom.db");
  });

  it("resolves to the repository root database from the repo root cwd", () => {
    const repoRoot = "/Users/ayberk/Desktop/AI Projects/VibeBasket";

    expect(resolveDatabaseUrl({ cwd: repoRoot, env: {} })).toBe(
      `file:${path.join(repoRoot, "vibebasket.db")}`
    );
  });

  it("resolves to the repository root database from an app package cwd", () => {
    const repoRoot = "/Users/ayberk/Desktop/AI Projects/VibeBasket";

    expect(resolveDatabaseUrl({ cwd: path.join(repoRoot, "apps", "web"), env: {} })).toBe(
      `file:${path.join(repoRoot, "vibebasket.db")}`
    );
  });
});
