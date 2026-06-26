import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SkillEntry } from "../../core/src/manifest.js";
import { KiroAdapter } from "./kiro.js";

describe("KiroAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes project-scoped skills into .kiro/skills", async () => {
    const adapter = new KiroAdapter();
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

    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.kiro/skills", { recursive: true });
    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.kiro/skills/skill-postgresql-helper", {
      recursive: true,
    });
    expect(writeSpy).toHaveBeenCalledWith(
      path.join("/tmp/workspace/.kiro/skills/skill-postgresql-helper", "SKILL.md"),
      expect.stringContaining("name: PostgreSQL Helper"),
      "utf8",
    );
  });
});
