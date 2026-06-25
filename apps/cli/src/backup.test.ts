import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("listBackups", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vibebasket-backups-"));
    fs.mkdirSync(path.join(tempDir, ".vibebasket", "backups"), { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("parses timestamps without corrupting the ISO shape", async () => {
    const backupPath = path.join(
      tempDir,
      ".vibebasket",
      "backups",
      "cursor-user-2025-03-15T08-30-00-000Z.json",
    );
    fs.writeFileSync(backupPath, "{}");

    const { listBackups } = await import("./backup.js");
    const backups = listBackups();

    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatchObject({
      targetId: "cursor",
      scope: "user",
      timestamp: "2025-03-15T08:30:00.000Z",
    });
  });

  it("sorts newer backups first after parsing", async () => {
    for (const filename of [
      "cursor-user-2025-03-15T08-30-00-000Z.json",
      "cursor-user-2025-03-16T08-30-00-000Z.json",
    ]) {
      fs.writeFileSync(path.join(tempDir, ".vibebasket", "backups", filename), "{}");
    }

    const { listBackups } = await import("./backup.js");
    const backups = listBackups();

    expect(backups.map((backup) => backup.timestamp)).toEqual([
      "2025-03-16T08:30:00.000Z",
      "2025-03-15T08:30:00.000Z",
    ]);
  });
});
