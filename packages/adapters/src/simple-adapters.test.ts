import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { McpEntry, SkillEntry } from "../../core/src/manifest.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { DeepSeekTuiAdapter } from "./deepseek-tui.js";
import { JunieAdapter } from "./junie.js";
import { VSCodeAdapter } from "./vscode.js";

describe("simple adapter coverage", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-simple-adapters-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("keeps VS Code, Junie, Cline CLI, and DeepSeek-TUI config paths stable", () => {
    const projectRoot = "/tmp/demo-project";

    expect(new VSCodeAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.vscode/cline_mcp_settings.json",
    );
    expect(new JunieAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.junie/mcp/mcp.json",
    );
    expect(new ClineCliAdapter().configPath()).toBe(
      `${os.homedir()}/.cline/data/settings/cline_mcp_settings.json`,
    );
    expect(new DeepSeekTuiAdapter().configPath()).toBe(`${os.homedir()}/.deepseek/mcp.json`);
  });

  it("keeps Claude Code MCP merge and project skills install working", async () => {
    const adapter = new ClaudeCodeAdapter();
    const mcp: McpEntry = {
      id: "ctx7",
      displayName: "Context7",
      runtime: "npx",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: true,
    };

    const merged = adapter.applyMcps({ mcpServers: {} }, [mcp], {}, { force: false }) as {
      mcpServers: Record<string, { command?: string; args?: string[] }>;
    };
    expect(merged.mcpServers.ctx7?.command).toBe("npx");

    const skills: SkillEntry[] = [
      {
        id: "react-stack",
        displayName: "React Stack",
        source: { type: "inline", content: "Prefer React and TypeScript." },
        verified: true,
      },
    ];

    await adapter.applySkills(skills, "project", tempDir);
    const skillFile = path.join(tempDir, ".claude", "skills", "react-stack", "SKILL.md");
    const content = await fs.readFile(skillFile, "utf8");

    expect(content).toContain("React Stack");
    expect(content).toContain("Prefer React and TypeScript.");
  });
});
