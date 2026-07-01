import { describe, expect, it } from "vitest";
import { BundleSchema, McpEntrySchema, SCHEMA_VERSION, isAllowedRemoteMcpUrl } from "./manifest";

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

    const result = BundleSchema.safeParse(validBundle);
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

    const result = BundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("should require at least one target IDE", () => {
    const noTargetsBundle = {
      schemaVersion: SCHEMA_VERSION,
      scope: "user",
      targets: [],
    };

    const result = BundleSchema.safeParse(noTargetsBundle);
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

    const result = BundleSchema.safeParse(bundleWithPack);
    expect(result.success).toBe(true);
  });

  it("allows only http and https remote MCP URLs", () => {
    expect(isAllowedRemoteMcpUrl("https://example.com/mcp")).toBe(true);
    expect(isAllowedRemoteMcpUrl("http://localhost:8080/mcp")).toBe(true);
    expect(isAllowedRemoteMcpUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedRemoteMcpUrl("file:///tmp/mcp")).toBe(false);
  });

  it("rejects non-http remote MCP URLs at schema level", () => {
    const result = McpEntrySchema.safeParse({
      id: "remote-bad",
      displayName: "Remote Bad",
      runtime: "remote",
      url: "javascript:alert(1)",
      args: [],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: false,
    });

    expect(result.success).toBe(false);
  });
});
