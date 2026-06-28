import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createManagedContentResult, upsertManagedTextFile } from "./managed-installs.js";

describe("managed installs", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-managed-installs-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("preserves existing foreign files", async () => {
    const baseDir = path.join(tempDir, "skills");
    const targetFile = path.join(baseDir, "postgres", "SKILL.md");
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, "custom user content", "utf8");

    const result = await upsertManagedTextFile({
      registryDir: baseDir,
      targetFile,
      kind: "skill",
      id: "postgres",
      content: "# PostgreSQL\n\nmanaged",
    });

    expect(result.skipped).toHaveLength(1);
    expect(await fs.readFile(targetFile, "utf8")).toBe("custom user content");
  });

  it("updates previously managed files and keeps a backup", async () => {
    const baseDir = path.join(tempDir, "skills");
    const targetFile = path.join(baseDir, "postgres", "SKILL.md");
    const initial = "# PostgreSQL\n\nv1";
    const next = "# PostgreSQL\n\nv2";

    const first = await upsertManagedTextFile({
      registryDir: baseDir,
      targetFile,
      kind: "skill",
      id: "postgres",
      content: initial,
    });
    expect(first.written).toEqual([targetFile]);

    const second = await upsertManagedTextFile({
      registryDir: baseDir,
      targetFile,
      kind: "skill",
      id: "postgres",
      content: next,
    });

    expect(second.updated).toEqual([targetFile]);
    expect(await fs.readFile(targetFile, "utf8")).toBe(next);

    const entries = await fs.readdir(path.dirname(targetFile));
    expect(entries.some((entry) => entry.startsWith("SKILL.md.bak."))).toBe(true);
  });

  it("claims legacy-managed content without rewriting identical files", async () => {
    const baseDir = path.join(tempDir, "skills");
    const targetFile = path.join(baseDir, "postgres", "SKILL.md");
    const content = "---\nname: PostgreSQL\ndescription: Installed by VibeBasket\n---\n";
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, content, "utf8");

    const result = await upsertManagedTextFile({
      registryDir: baseDir,
      targetFile,
      kind: "skill",
      id: "postgres",
      content,
      isLegacyManagedContent: (currentContent) =>
        currentContent.includes("Installed by VibeBasket"),
    });

    expect(result.unchanged).toEqual([targetFile]);
    const registryPath = path.join(baseDir, ".vibebasket-managed.json");
    const registry = JSON.parse(await fs.readFile(registryPath, "utf8")) as {
      entries: Record<string, { id: string }>;
    };
    expect(registry.entries["postgres/SKILL.md"]?.id).toBe("postgres");
  });

  it("can merge result buckets in caller-owned accumulators", () => {
    const result = createManagedContentResult();
    result.written.push("/tmp/a");
    result.updated.push("/tmp/b");

    expect(result).toEqual({
      written: ["/tmp/a"],
      updated: ["/tmp/b"],
      unchanged: [],
      skipped: [],
    });
  });
});
