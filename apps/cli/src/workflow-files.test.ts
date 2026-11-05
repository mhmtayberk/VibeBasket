import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyWorkflowFiles } from "./workflow-files.js";

describe("applyWorkflowFiles", () => {
  let tempDir: string;
  let projectRoot: string;
  let outsideDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-workflow-files-"));
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

  it("preserves normal skip, merge, and overwrite behavior", async () => {
    const file = path.join(projectRoot, ".agent", "workflow.md");
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, "existing\n", "utf8");

    const skipped = await applyWorkflowFiles(
      [{ path: ".agent/workflow.md", content: "skip", ifExists: "skip" }],
      projectRoot,
    );
    expect(skipped.skipped).toHaveLength(1);

    await applyWorkflowFiles(
      [{ path: ".agent/workflow.md", content: "merged", ifExists: "merge" }],
      projectRoot,
    );
    expect(await fs.readFile(file, "utf8")).toContain("existing\n\nmerged");

    await applyWorkflowFiles(
      [{ path: ".agent/workflow.md", content: "replacement", ifExists: "overwrite" }],
      projectRoot,
    );
    expect(await fs.readFile(file, "utf8")).toBe("replacement");
  });

  it("rejects a symbolic-link destination without changing the outside file", async () => {
    const outsideFile = path.join(outsideDir, "workflow.md");
    const linkedFile = path.join(projectRoot, "workflow.md");
    await fs.writeFile(outsideFile, "outside", "utf8");
    await fs.symlink(outsideFile, linkedFile);

    await expect(
      applyWorkflowFiles(
        [{ path: "workflow.md", content: "replacement", ifExists: "overwrite" }],
        projectRoot,
      ),
    ).rejects.toThrow(/symbolic link/);
    expect(await fs.readFile(outsideFile, "utf8")).toBe("outside");
  });

  it("rejects a symbolic-link parent without creating an outside file", async () => {
    await fs.symlink(outsideDir, path.join(projectRoot, ".agent"), "dir");

    await expect(
      applyWorkflowFiles(
        [{ path: ".agent/workflow.md", content: "blocked", ifExists: "overwrite" }],
        projectRoot,
      ),
    ).rejects.toThrow(/symbolic link/);
    await expect(fs.stat(path.join(outsideDir, "workflow.md"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("rejects a pre-existing symbolic-link backup destination", async () => {
    const timestamp = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const file = path.join(projectRoot, "workflow.md");
    const outsideFile = path.join(outsideDir, "captured.md");
    await fs.writeFile(file, "original", "utf8");
    await fs.writeFile(outsideFile, "outside", "utf8");
    await fs.symlink(outsideFile, `${file}.bak.${timestamp}`);

    await expect(
      applyWorkflowFiles(
        [{ path: "workflow.md", content: "replacement", ifExists: "overwrite" }],
        projectRoot,
      ),
    ).rejects.toThrow(/symbolic link/);
    expect(await fs.readFile(file, "utf8")).toBe("original");
    expect(await fs.readFile(outsideFile, "utf8")).toBe("outside");
  });
});
