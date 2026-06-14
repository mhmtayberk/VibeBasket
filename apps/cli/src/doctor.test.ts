import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { readCfg } = vi.hoisted(() => {
  const fn = vi.fn(async () => ({}));
  return { readCfg: fn };
});

vi.mock("@vibebasket/adapters", () => {
  const cfgPath = vi.fn(() => "/fake/config.json");

  class DoctorAdapter {
    displayName = "Test IDE";
    supportsMcp = true;
    supportsSkills = true;
    supportsRules = true;
    readConfig = readCfg;
    configPath = cfgPath;
    supportedScopes: readonly string[] = ["user"];
  }

  const names = [
    "CursorAdapter",
    "AntigravityAdapter",
    "WindsurfAdapter",
    "VSCodeAdapter",
    "ClaudeCodeAdapter",
    "DeepSeekTuiAdapter",
    "GeminiCliAdapter",
    "KiroAdapter",
    "JunieAdapter",
    "ClineCliAdapter",
    "ZedAdapter",
    "CodexAdapter",
    "ContinueAdapter",
    "RooCodeAdapter",
    "HermesAdapter",
    "OpenClawAdapter",
    "GitHubCopilotAdapter",
    "VoidAdapter",
    "AiderAdapter",
    "CortexCodeAdapter",
    "GooseAdapter",
    "IBMBobAdapter",
    "CodeBuddyAdapter",
    "OpenCodeAdapter",
  ];

  const result: Record<string, unknown> = {};
  for (const name of names) {
    result[name] = DoctorAdapter;
  }
  return result;
});

let consoleOutput: string[] = [];
const originalLog = console.log;

describe("runDoctor", () => {
  beforeEach(() => {
    consoleOutput = [];
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
    readCfg.mockReset();
    readCfg.mockResolvedValue({ mcpServers: {} });
  });

  afterEach(() => {
    console.log = originalLog;
    vi.restoreAllMocks();
  });

  it("prints the diagnostics header", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("Running diagnostics"))).toBe(true);
  });

  it("checks .vibebasket/ directory status", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes(".vibebasket/"))).toBe(true);
  });

  it("checks .vibebasket.env file status", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes(".vibebasket.env"))).toBe(true);
  });

  it("checks all 24 IDE configurations", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("Summary:"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("/24"))).toBe(true);
  });

  it("counts MCP servers per IDE when config is readable", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    readCfg.mockResolvedValue({
      mcpServers: { github: {}, postgres: {}, slack: {} },
    });

    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("MCP(s)"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("3 MCP(s)"))).toBe(true);
  });

  it("handles corrupt config read gracefully", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    readCfg.mockRejectedValue(new Error("corrupted JSON"));

    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("Summary:"))).toBe(true);
  });

  it("reports IDE with capabilities tags", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("[MCP, Skills, Rules]"))).toBe(true);
  });

  it("reports environment info", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("Node:"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("OS:"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("CWD:"))).toBe(true);
  });

  it("reports total MCP count in summary", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    readCfg.mockResolvedValue({ mcpServers: { a: {}, b: {} } });

    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("total MCP servers detected"))).toBe(true);
  });

  it("includes IDE configuration section header", async () => {
    const { runDoctor } = await import("./doctor.js");
    await runDoctor();

    expect(consoleOutput.some((line) => line.includes("IDE Configurations"))).toBe(true);
  });
});
