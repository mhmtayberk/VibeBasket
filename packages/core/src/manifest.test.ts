import { describe, expect, it } from "vitest";
import { Bundle, SCHEMA_VERSION } from "./manifest";

describe("manifest", () => {
  it("should validate a valid bundle", () => {
    const validBundle = {
      schemaVersion: SCHEMA_VERSION,
      name: "Test Bundle",
      scope: "project",
      targets: ["cursor"],
      mcps: [
        {
          id: "test-mcp",
          displayName: "Test MCP",
          runtime: "npx",
          command: "npx",
          args: ["-y", "test-mcp"],
        },
      ],
    };

    const result = Bundle.safeParse(validBundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mcps[0]?.id).toBe("test-mcp");
    }
  });

  it("should fail validation on invalid schemaVersion", () => {
    const invalidBundle = {
      schemaVersion: "9.9",
      scope: "user",
      targets: ["cursor"],
    };

    const result = Bundle.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("should require at least one target IDE", () => {
    const noTargetsBundle = {
      schemaVersion: SCHEMA_VERSION,
      scope: "user",
      targets: [],
    };

    const result = Bundle.safeParse(noTargetsBundle);
    expect(result.success).toBe(false);
  });

  it("should validate a complex workflow pack", () => {
    const bundleWithPack = {
      schemaVersion: SCHEMA_VERSION,
      scope: "project",
      targets: ["vscode", "windsurf"],
      workflowPacks: [
        {
          id: "cline-memory-bank",
          displayName: "Cline Memory Bank",
          files: [
            {
              path: "memory-bank/activeContext.md",
              content: "# Active Context",
              ifExists: "skip",
            },
          ],
          rules: [
            {
              id: "update-memory-bank",
              displayName: "Update Memory Bank",
              content: "Always update the memory bank",
            },
          ],
        },
      ],
    };

    const result = Bundle.safeParse(bundleWithPack);
    expect(result.success).toBe(true);
  });
});
