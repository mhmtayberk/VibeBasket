import { describe, expect, it } from "vitest";
import { McpEntrySchema } from "./schemas";

describe("registry McpEntrySchema", () => {
  it("accepts http and https remote MCP URLs", () => {
    expect(
      McpEntrySchema.safeParse({
        id: "remote-good",
        displayName: "Remote Good",
        runtime: "remote",
        url: "https://example.com/mcp",
        args: [],
        env: {},
        headers: {},
        requiredSecrets: [],
        verified: false,
      }).success,
    ).toBe(true);
  });

  it("rejects non-http remote MCP URLs", () => {
    expect(
      McpEntrySchema.safeParse({
        id: "remote-bad",
        displayName: "Remote Bad",
        runtime: "remote",
        url: "javascript:alert(1)",
        args: [],
        env: {},
        headers: {},
        requiredSecrets: [],
        verified: false,
      }).success,
    ).toBe(false);
  });
});
