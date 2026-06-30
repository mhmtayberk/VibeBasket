import { describe, expect, it } from "vitest";
import { formatVerificationSummary } from "./install-verification.js";

describe("formatVerificationSummary", () => {
  it("omits MCP confirmation when a target did not receive any MCP content", () => {
    expect(
      formatVerificationSummary({
        ok: true,
        targetId: "github-copilot",
        displayName: "GitHub Copilot",
        configPath: "/tmp/demo/.github/copilot-instructions.md",
        mcpChecked: false,
        missingMcpIds: [],
        configReadable: true,
        skills: {
          checked: true,
          verified: true,
          missingPaths: [],
          missingMarkerIds: [],
        },
        rules: {
          checked: true,
          verified: true,
          missingPaths: [],
          missingMarkerIds: [],
        },
      }),
    ).toBe("config readback ok, skills confirmed, rules confirmed");
  });

  it("keeps MCP confirmation when MCP entries were actually checked", () => {
    expect(
      formatVerificationSummary({
        ok: true,
        targetId: "cursor",
        displayName: "Cursor",
        configPath: "/tmp/demo/.cursor/mcp.json",
        mcpChecked: true,
        missingMcpIds: [],
        configReadable: true,
        skills: {
          checked: true,
          verified: true,
          missingPaths: [],
          missingMarkerIds: [],
        },
        rules: {
          checked: true,
          verified: true,
          missingPaths: [],
          missingMarkerIds: [],
        },
      }),
    ).toBe("config readback ok, MCP entries confirmed, skills confirmed, rules confirmed");
  });
});
