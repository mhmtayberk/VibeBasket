import fs from "node:fs/promises";
import path from "node:path";
import type { RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WindsurfAdapter } from "./windsurf.js";

describe("WindsurfAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes project-scoped skills into .windsurf/skills", async () => {
    const adapter = new WindsurfAdapter();
    const mkdirSpy = vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const writeSpy = vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    await adapter.applySkills?.(
      [
        {
          id: "skill-postgresql-helper",
          displayName: "PostgreSQL Helper",
          verified: false,
          source: {
            type: "github",
            repo: "acme/skills",
            path: "postgresql-helper",
          },
        } satisfies SkillEntry,
      ],
      "project",
      "/tmp/workspace",
    );

    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.windsurf/skills", { recursive: true });
    expect(mkdirSpy).toHaveBeenCalledWith(
      "/tmp/workspace/.windsurf/skills/skill-postgresql-helper",
      { recursive: true },
    );
    expect(writeSpy).toHaveBeenCalledWith(
      path.join("/tmp/workspace/.windsurf/skills/skill-postgresql-helper", "SKILL.md"),
      expect.stringContaining("name: PostgreSQL Helper"),
      "utf8",
    );
  });

  it("writes project-scoped rules into .devin/rules", async () => {
    const adapter = new WindsurfAdapter();
    const mkdirSpy = vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const writeSpy = vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    await adapter.applyRules?.(
      [
        {
          id: "typescript-style",
          displayName: "TypeScript Style",
          content: "Always use strict TypeScript.",
          verified: false,
        } satisfies RuleEntry,
      ],
      "project",
      "/tmp/workspace",
    );

    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.devin/rules", { recursive: true });
    expect(writeSpy).toHaveBeenCalledWith(
      path.join("/tmp/workspace/.devin/rules", "typescript-style.md"),
      expect.stringContaining("trigger: always_on"),
      "utf8",
    );
  });
});
