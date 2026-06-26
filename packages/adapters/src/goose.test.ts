import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GooseAdapter } from "./goose";

describe("GooseAdapter", () => {
  let tmpDir: string;
  const adapter = new GooseAdapter();

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `vibebasket-test-goose-${Date.now()}`);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resolves global config path", () => {
    expect(adapter.configPath()).toContain(".config/goose/config.yaml");
  });

  it("has correct capabilities", () => {
    expect(adapter.supportsMcp).toBe(true);
    expect(adapter.supportsSkills).toBe(false);
    expect(adapter.supportsRules).toBe(false);
    expect(adapter.displayName).toBe("Goose");
  });

  it("applies MCP servers to config", () => {
    const config = { raw: "", extensions: {} };
    const mcps = [
      {
        id: "test",
        displayName: "T",
        runtime: "npx" as const,
        command: "c",
        args: [],
        env: {},
        headers: {},
        requiredSecrets: [],
        verified: false,
      },
    ];
    const result = adapter.applyMcps(config, mcps, {}, { force: false });
    expect(result).toHaveProperty("extensions.test");
  });

  it("writes extensions into goose config.yaml", async () => {
    const configPath = path.join(tmpDir, "config.yaml");
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, "GOOSE_PROVIDER: anthropic\n");

    const rendered = adapter.applyMcps(
      { raw: "GOOSE_PROVIDER: anthropic\n", extensions: {} },
      [
        {
          id: "github",
          displayName: "GitHub",
          runtime: "npx",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          env: {},
          headers: {},
          requiredSecrets: [],
          verified: true,
        },
      ],
      {},
      { force: false },
    );

    await expect(adapter.diff("user", rendered)).resolves.toContain("extensions:");
  });

  it("escapes backslashes and quotes in env values for YAML output", async () => {
    const rendered = adapter.applyMcps(
      { raw: "", extensions: {} },
      [
        {
          id: "escaped",
          displayName: "Escaped",
          runtime: "node",
          command: "node",
          args: ["server.js"],
          env: {
            TEST_SECRET: "${secret:TEST_SECRET}",
          },
          headers: {},
          requiredSecrets: ["TEST_SECRET"],
          verified: true,
        },
      ],
      {
        TEST_SECRET: String.raw`C:\temp\"quoted"`,
      },
      { force: false },
    );

    const diff = await adapter.diff("user", rendered);
    expect(diff).toContain(String.raw`TEST_SECRET: "C:\\temp\\\"quoted\""`);
  });
});
