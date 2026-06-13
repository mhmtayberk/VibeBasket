import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const confirmMock = vi.fn(async () => true);
const selectMock = vi.fn(async (opts: { choices: Array<{ name: string; value: unknown }> }) => {
  return opts.choices[0]?.value;
});

vi.mock("@inquirer/prompts", () => ({
  confirm: confirmMock,
  select: selectMock,
  input: vi.fn(async () => ""),
  password: vi.fn(async () => ""),
}));

const writeConfigMock = vi.fn(async () => undefined);
const readConfigMock = vi.fn(async () => ({}));

class RollbackAdapter {
  displayName = "Test IDE";
  writeConfig = writeConfigMock;
  readConfig = readConfigMock;
  supportedScopes: readonly string[] = ["user"];
}

const allRollbackAdapters: Record<string, unknown> = {};
for (const name of [
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
]) {
  allRollbackAdapters[name] = RollbackAdapter;
}

vi.mock("@vibebasket/adapters", () => allRollbackAdapters);

let consoleOutput: string[] = [];
const originalLog = console.log;

describe("runRollback", () => {
  let tempDir: string;
  let originalBackupDir: string;
  const backupDirName = ".vibebasket/backups";

  beforeEach(() => {
    consoleOutput = [];
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    selectMock.mockReset();
    writeConfigMock.mockClear();
    writeConfigMock.mockResolvedValue(undefined);

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vibebasket-rollback-"));
    originalBackupDir = path.join(tempDir, backupDirName);
    fs.mkdirSync(originalBackupDir, { recursive: true });

    vi.spyOn(process, "cwd").mockReturnValue(tempDir);

    vi.doMock("./backup.js", () => ({
      listBackups: () => {
        if (!fs.existsSync(path.join(tempDir, backupDirName))) return [];
        return fs
          .readdirSync(path.join(tempDir, backupDirName))
          .filter((f) => f.endsWith(".json"))
          .map((f) => {
            const parts = f.replace(".json", "").split("-");
            const targetId = parts[0];
            const scope = parts[1];
            const timestamp = parts.slice(2).join("-").replace(/-/g, ":");
            return {
              filename: f,
              targetId,
              scope,
              timestamp,
              path: path.join(tempDir, backupDirName, f),
            };
          })
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      },
      createBackup: vi.fn(async () => "/tmp/backup.json"),
    }));
  });

  afterEach(() => {
    console.log = originalLog;
    vi.restoreAllMocks();
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function createBackupFile(targetId: string, scope: string, dateStr: string, config: unknown) {
    const filename = `${targetId}-${scope}-${dateStr.replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(originalBackupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  it("shows message when no backups exist", async () => {
    const { runRollback } = await import("./rollback.js");
    await runRollback();

    expect(consoleOutput.some((line) => line.includes("No backups found"))).toBe(true);
  });

  it("lists backups sorted by timestamp to select", async () => {
    createBackupFile("cursor", "user", "2025-01-01T10:00:00.000Z", { mcpServers: {} });
    createBackupFile("windsurf", "project", "2025-06-01T12:00:00.000Z", { mcpServers: { github: {} } });

    const { runRollback } = await import("./rollback.js");
    await runRollback();

    expect(selectMock).toHaveBeenCalled();
    const choices = selectMock.mock.calls[0][0].choices;
    expect(choices.length).toBe(2);
    expect(choices[0].name).toContain("windsurf");

    expect(writeConfigMock).toHaveBeenCalled();
  });

  it("aborts when user declines the restore confirmation", async () => {
    createBackupFile("cursor", "user", "2025-01-01T10:00:00.000Z", { mcpServers: {} });
    confirmMock.mockResolvedValueOnce(false);

    const { runRollback } = await import("./rollback.js");
    await runRollback();

    expect(writeConfigMock).not.toHaveBeenCalled();
    expect(consoleOutput.some((line) => line.includes("Aborted"))).toBe(true);
  });

  it("restores the selected backup config", async () => {
    const config = { mcpServers: { github: { args: ["test"] } } };
    createBackupFile("cursor", "user", "2025-03-15T08:30:00.000Z", config);

    const { runRollback } = await import("./rollback.js");
    await runRollback();

    expect(writeConfigMock).toHaveBeenCalledWith("user", expect.objectContaining({ mcpServers: { github: { args: ["test"] } } }));
    expect(consoleOutput.some((line) => line.includes("Successfully restored"))).toBe(true);
  });

  it("handles corrupted backup JSON", async () => {
    const badFilePath = path.join(originalBackupDir, "cursor-user-2025-01-01T10-00-00-000Z.json");
    fs.writeFileSync(badFilePath, "not valid json {{{");

    selectMock.mockResolvedValueOnce({
      filename: "cursor-user-2025-01-01T10-00-00-000Z.json",
      targetId: "cursor",
      scope: "user",
      timestamp: "2025-01-01T10:00:00.000Z",
      path: badFilePath,
    });

    const { runRollback } = await import("./rollback.js");
    await expect(runRollback()).rejects.toThrow();
  });

  it("throws when adapter not found for target", async () => {
    createBackupFile("unknown-ide", "user", "2025-01-01T10:00:00.000Z", { mcpServers: {} });

    const { runRollback } = await import("./rollback.js");
    await expect(runRollback()).rejects.toThrow("No adapter found for target");
  });

  it("limits displayed backups to 10 most recent", async () => {
    for (let i = 0; i < 15; i++) {
      const hour = String(i).padStart(2, "0");
      createBackupFile("cursor", "user", `2025-01-01T${hour}:00:00.000Z`, { mcpServers: {} });
    }

    const { runRollback } = await import("./rollback.js");
    await runRollback();

    const choices = selectMock.mock.calls[0][0].choices;
    expect(choices.length).toBe(10);
  });
});
