import type { Bundle } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { flattenBundleContent, getUnsupportedTargetContent } from "./apply-helpers.js";

describe("apply helpers", () => {
  it("flattens workflow pack content into the main apply payload", () => {
    const bundle = {
      schemaVersion: "0.1",
      scope: "user",
      targets: ["cursor"],
      mcps: [
        {
          id: "mcp-a",
          displayName: "A",
          runtime: "npx",
          args: [],
          env: {},
          requiredSecrets: [],
          verified: false,
        },
      ],
      skills: [],
      rules: [],
      workflowPacks: [
        {
          id: "wf-a",
          displayName: "Workflow A",
          files: [{ path: ".cursor/rules.md", content: "hi", ifExists: "skip" }],
          rules: [{ id: "rule-a", displayName: "Rule A", content: "always", verified: false }],
          mcps: [
            {
              id: "mcp-b",
              displayName: "B",
              runtime: "npx",
              args: [],
              env: {},
              requiredSecrets: [],
              verified: false,
            },
          ],
          skills: [
            {
              id: "skill-a",
              displayName: "Skill A",
              source: { type: "inline", content: "x" },
              verified: false,
            },
          ],
        },
      ],
    } satisfies Bundle;

    const flattened = flattenBundleContent(bundle);

    expect(flattened.mcps.map((item) => item.id)).toEqual(["mcp-a", "mcp-b"]);
    expect(flattened.skills.map((item) => item.id)).toEqual(["skill-a"]);
    expect(flattened.rules.map((item) => item.id)).toEqual(["rule-a"]);
    expect(flattened.files).toHaveLength(1);
  });

  it("detects unsupported non-MCP content for adapters that only implement MCP writes", () => {
    const bundle = {
      schemaVersion: "0.1",
      scope: "user",
      targets: ["cursor"],
      mcps: [],
      skills: [
        {
          id: "skill-a",
          displayName: "Skill A",
          source: { type: "inline", content: "x" },
          verified: false,
        },
      ],
      rules: [{ id: "rule-a", displayName: "Rule A", content: "always", verified: false }],
      workflowPacks: [],
    } satisfies Bundle;

    const unsupported = getUnsupportedTargetContent(
      { displayName: "Cursor" },
      flattenBundleContent(bundle),
    );

    expect(unsupported).toEqual(["skills", "rules"]);
  });
});
