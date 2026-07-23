import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writeConfigMock = vi.fn();

vi.mock("../runtime/adapters.js", () => ({
  getAdapter: vi.fn(() => ({
    displayName: "Cursor",
    writeConfig: writeConfigMock,
  })),
}));

describe("restoreBackupByPath", () => {
  const originalCwd = process.cwd();
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "vibebasket-rollback-"));
    process.chdir(tempDir);
    fs.mkdirSync(path.join(tempDir, ".vibebasket", "backups"), { recursive: true });
    writeConfigMock.mockReset();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it("restores a backup by filename", async () => {
    const backupFilename = "cursor-user-2026-07-23T12-00-00-000Z.json";
    const backupPath = path.join(tempDir, ".vibebasket", "backups", backupFilename);
    fs.writeFileSync(backupPath, JSON.stringify({ mcpServers: {} }));

    const { restoreBackupByPath } = await import("./rollback-service.js");
    const result = await restoreBackupByPath(backupFilename);

    expect(result.restored).toBe(true);
    expect(result.targetId).toBe("cursor");
    expect(writeConfigMock).toHaveBeenCalledWith("user", { mcpServers: {} }, undefined);
  });
});
