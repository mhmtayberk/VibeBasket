import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { McpEntry } from "../../core/src/manifest.js";
import {
  readJsonFileOrDefault,
  toStandardMcpServerConfig,
  writeJsonFileWithBackup,
} from "./mcp-utils.js";

describe("toStandardMcpServerConfig", () => {
  it("maps remote MCP entries to HTTP configs", () => {
    const mcp: McpEntry = {
      id: "remote-docs",
      displayName: "Remote Docs",
      runtime: "remote",
      url: "https://example.com/mcp",
      args: [],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: false,
    };

    expect(toStandardMcpServerConfig(mcp, {})).toEqual({
      type: "http",
      url: "https://example.com/mcp",
    });
  });

  it("resolves remote header secrets into HTTP configs", () => {
    const mcp: McpEntry = {
      id: "remote-auth",
      displayName: "Remote Auth",
      runtime: "remote",
      url: "https://example.com/mcp",
      args: [],
      env: {},
      headers: {
        Authorization: "${secret:REMOTE_TOKEN}",
      },
      requiredSecrets: ["REMOTE_TOKEN"],
      verified: false,
    };

    expect(toStandardMcpServerConfig(mcp, { REMOTE_TOKEN: "Bearer abc123" })).toEqual({
      type: "http",
      url: "https://example.com/mcp",
      headers: {
        Authorization: "Bearer abc123",
      },
    });
  });
});

describe("project-scoped JSON file safety", () => {
  let tempDir: string;
  let projectRoot: string;
  let outsideDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-mcp-utils-"));
    projectRoot = path.join(tempDir, "project");
    outsideDir = path.join(tempDir, "outside");
    await Promise.all([
      fs.mkdir(projectRoot, { recursive: true }),
      fs.mkdir(outsideDir, { recursive: true }),
    ]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("writes and backs up regular files inside the project root", async () => {
    const file = path.join(projectRoot, ".tool", "mcp.json");
    await writeJsonFileWithBackup(file, { version: 1 }, projectRoot);
    await writeJsonFileWithBackup(file, { version: 2 }, projectRoot);

    expect(await readJsonFileOrDefault(file, {}, projectRoot)).toEqual({ version: 2 });
    const entries = await fs.readdir(path.dirname(file));
    expect(entries.some((entry) => entry.startsWith("mcp.json.bak."))).toBe(true);
  });

  it("rejects a symbolic-link destination before reading or writing it", async () => {
    const outsideFile = path.join(outsideDir, "mcp.json");
    const linkedFile = path.join(projectRoot, "mcp.json");
    await fs.writeFile(outsideFile, '{"outside":true}', "utf8");
    await fs.symlink(outsideFile, linkedFile);

    await expect(readJsonFileOrDefault(linkedFile, {}, projectRoot)).rejects.toThrow(
      /symbolic link/,
    );
    await expect(
      writeJsonFileWithBackup(linkedFile, { outside: false }, projectRoot),
    ).rejects.toThrow(/symbolic link/);
    expect(await fs.readFile(outsideFile, "utf8")).toBe('{"outside":true}');
  });

  it("rejects a symbolic-link parent directory", async () => {
    const linkedDir = path.join(projectRoot, ".tool");
    await fs.symlink(outsideDir, linkedDir, "dir");

    await expect(
      writeJsonFileWithBackup(path.join(linkedDir, "mcp.json"), { blocked: true }, projectRoot),
    ).rejects.toThrow(/symbolic link/);
    await expect(fs.stat(path.join(outsideDir, "mcp.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("rejects a pre-existing symbolic-link backup destination", async () => {
    const timestamp = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const file = path.join(projectRoot, "mcp.json");
    const outsideFile = path.join(outsideDir, "captured.json");
    await fs.writeFile(file, '{"version":1}', "utf8");
    await fs.writeFile(outsideFile, "outside", "utf8");
    await fs.symlink(outsideFile, `${file}.bak.${timestamp}`);

    await expect(writeJsonFileWithBackup(file, { version: 2 }, projectRoot)).rejects.toThrow(
      /symbolic link/,
    );
    expect(await fs.readFile(file, "utf8")).toBe('{"version":1}');
    expect(await fs.readFile(outsideFile, "utf8")).toBe("outside");
  });
});
