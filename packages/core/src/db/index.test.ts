import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./index";

function findRepoRoot(): string {
	let current = path.dirname(fileURLToPath(import.meta.url));
	while (current !== path.parse(current).root) {
		if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
			return current;
		}
		current = path.dirname(current);
	}
	throw new Error("Could not find repo root");
}

const repoRoot = findRepoRoot();

describe("resolveDatabaseUrl", () => {
  it("prefers DATABASE_URL when provided", () => {
    expect(resolveDatabaseUrl({
      cwd: "/tmp/project",
      env: { DATABASE_URL: "file:/tmp/custom.db" },
    })).toBe("file:/tmp/custom.db");
  });

  it("resolves to the repository root database from the repo root cwd", () => {
    expect(resolveDatabaseUrl({ cwd: repoRoot, env: {} })).toBe(
      `file:${path.join(repoRoot, "vibebasket.db")}`
    );
  });

  it("resolves to the repository root database from an app package cwd", () => {
    expect(resolveDatabaseUrl({ cwd: path.join(repoRoot, "apps", "web"), env: {} })).toBe(
      `file:${path.join(repoRoot, "vibebasket.db")}`
    );
  });
});