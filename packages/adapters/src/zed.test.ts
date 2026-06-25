import fs from "node:fs/promises";
import path from "node:path";
import type { SkillEntry } from "../../core/src/manifest.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZedAdapter } from "./zed.js";

describe("ZedAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes MCP servers into context_servers for Zed compatibility", () => {
    const adapter = new ZedAdapter();

    const next = adapter.applyMcps(
      { context_servers: {} },
      [
        {
          id: "postgres",
          displayName: "Postgres",
          runtime: "npx",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-postgres"],
          env: {},
          headers: {},
          requiredSecrets: [],
          verified: false,
        },
      ],
      {},
      { force: false },
    ) as { context_servers?: Record<string, unknown>; mcpServers?: Record<string, unknown> };

    expect(next.context_servers).toBeDefined();
    expect(next.context_servers?.postgres).toBeDefined();
    expect(next.mcpServers).toBeUndefined();
  });

  it("writes project-scoped skills into .agents/skills", async () => {
    const adapter = new ZedAdapter();
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

    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.agents/skills", { recursive: true });
    expect(mkdirSpy).toHaveBeenCalledWith("/tmp/workspace/.agents/skills/skill-postgresql-helper", {
      recursive: true,
    });
    expect(writeSpy).toHaveBeenCalledWith(
      path.join("/tmp/workspace/.agents/skills/skill-postgresql-helper", "SKILL.md"),
      expect.stringContaining("name: PostgreSQL Helper"),
      "utf8",
    );
  });
});
