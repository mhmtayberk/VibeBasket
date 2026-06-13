import { describe, expect, it, vi, afterEach } from "vitest";

const { readCfg } = vi.hoisted(() => {
  const fn = vi.fn(async () => ({ mcpServers: {} }));
  return { readCfg: fn };
});

vi.mock("node:fs", async (importOriginal) => {
  const original = (await importOriginal()) as typeof import("node:fs");
  return {
    ...original,
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    readFileSync: vi.fn(() => ""),
    accessSync: vi.fn(() => {
      throw new Error("ENOENT");
    }),
  };
});

vi.mock("@vibebasket/adapters", () => {
  class FullAdapter {
    displayName = "Full Adapter";
    supportsMcp = true;
    supportsSkills = true;
    supportsRules = true;
    readConfig = readCfg;
    supportedScopes: readonly string[] = ["user", "project"];
  }

  const names = [
    "CursorAdapter", "AntigravityAdapter", "WindsurfAdapter", "VSCodeAdapter",
    "ClaudeCodeAdapter", "DeepSeekTuiAdapter", "GeminiCliAdapter", "KiroAdapter",
    "JunieAdapter", "ClineCliAdapter", "ZedAdapter", "CodexAdapter",
    "ContinueAdapter", "RooCodeAdapter", "HermesAdapter", "OpenClawAdapter",
    "GitHubCopilotAdapter", "VoidAdapter", "AiderAdapter", "CortexCodeAdapter",
    "GooseAdapter", "IBMBobAdapter", "CodeBuddyAdapter", "OpenCodeAdapter",
  ];

  const result: Record<string, unknown> = {};
  for (const name of names) {
    result[name] = FullAdapter;
  }
  return result;
});

let consoleOutput: string[] = [];
const originalLog = console.log;

describe("runList", () => {
  afterEach(() => {
    consoleOutput = [];
    console.log = originalLog;
    readCfg.mockReset();
    readCfg.mockResolvedValue({ mcpServers: {} });
  });

  function captureLog() {
    consoleOutput = [];
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
  }

  it("outputs a header and iterates over all adapters", async () => {
    captureLog();
    const { runList } = await import("./list.js");
    await runList();

    expect(consoleOutput.some((line) => line.includes("Installed IDE Configurations"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("Full Adapter"))).toBe(true);
  });

  it("shows MCP server names from adapter config", async () => {
    readCfg.mockResolvedValue({
      mcpServers: { github: {}, postgres: {} },
    });

    captureLog();
    const { runList } = await import("./list.js");
    await runList();

    expect(consoleOutput.some((line) => line.includes("MCP Servers (2)"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("github"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("postgres"))).toBe(true);
  });

  it("shows 'none' when adapter has no MCP servers", async () => {
    readCfg.mockResolvedValue({ mcpServers: {} });

    captureLog();
    const { runList } = await import("./list.js");
    await runList();

    expect(consoleOutput.some((line) => line.includes("MCP Servers:") && line.includes("none"))).toBe(true);
  });

  it("handles adapter readConfig errors gracefully", async () => {
    readCfg.mockRejectedValue(new Error("permission denied"));

    captureLog();
    const { runList } = await import("./list.js");
    await runList();

    expect(consoleOutput.some((line) => line.includes("Full Adapter"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("none"))).toBe(true);
  });

  it("shows 'No VibeBasket-managed content found' when adapter has no content", async () => {
    readCfg.mockResolvedValue({ mcpServers: {} });

    captureLog();
    const { runList } = await import("./list.js");
    await runList();

    expect(consoleOutput.some((line) => line.includes("No VibeBasket-managed content found"))).toBe(true);
  });
});
