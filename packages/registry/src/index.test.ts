import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { RegistrySyncService } from "./index";

const tempFiles: string[] = [];

afterEach(async () => {
  await Promise.all(tempFiles.map(async (file) => {
    await fs.rm(file, { force: true });
  }));
  tempFiles.length = 0;
});

async function createVerifiedCatalog(contents: string) {
  const file = path.join(os.tmpdir(), `vibebasket-registry-${Date.now()}-${Math.random()}.yaml`);
  tempFiles.push(file);
  await fs.writeFile(file, contents, "utf8");
  return file;
}

describe("RegistrySyncService", () => {
  it("merges verified catalog items with trusted upstream sources and dedupes by canonical identity", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps:
  - id: mcp-github
    displayName: GitHub
    runtime: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    verified: true
skills:
  - id: verified-skill
    displayName: Verified Skill
    source:
      type: github
      repo: vercel-labs/agent-skills
      path: next-js-development
      ref: main
    verified: true
workflowPacks:
  - id: cline-memory-bank
    displayName: Cline Memory Bank
    rules:
      - id: rule-memory-bank
        displayName: Memory Bank Standard
        content: Always maintain the memory bank.
`);

    const responses = new Map<string, unknown>([
      ["https://registry.modelcontextprotocol.io/v0.1/servers?limit=100", {
        servers: [
          {
            name: "io.github.github/github",
            title: "GitHub",
            description: "Official GitHub MCP",
            packages: [
              {
                registryType: "npm",
                identifier: "@modelcontextprotocol/server-github",
                version: "latest",
                transport: { type: "stdio" },
              },
            ],
          },
          {
            name: "io.github.example/example-remote",
            title: "Example Remote",
            description: "Remote MCP",
            remotes: [{ url: "https://example.com/mcp" }],
          },
        ],
        metadata: {},
      }],
      ["https://www.skills.sh/official", `
        <html>
          <body>
            <a href="/vercel-labs/agent-skills">Vercel Labs</a>
            <a href="/copycat/skills">Copycat</a>
          </body>
        </html>
      `],
      ["https://www.skills.sh/vercel-labs/agent-skills", `
        <html>
          <body>
            <a href="/vercel-labs/agent-skills/next-js-development">Next.js Development</a>
            <a href="/vercel-labs/agent-skills/next-js-development">Next.js Development</a>
          </body>
        </html>
      `],
      ["https://www.skills.sh/copycat/skills", `
        <html>
          <body>
            <a href="/copycat/skills/next-js-development">Next.js Development</a>
          </body>
        </html>
      `],
    ]);

    const fetchImpl: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      const payload = responses.get(url);
      if (!payload) {
        throw new Error(`Unexpected URL ${url}`);
      }

      if (typeof payload === "string") {
        return new Response(payload, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const service = new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    });

    const items = await service.collectCatalogItems();
    const ids = items.map((item) => item.id).sort();

    expect(ids).toContain("mcp-github");
    expect(ids).toContain("cline-memory-bank");
    expect(ids).toContain("rule-memory-bank");
    expect(ids).toContain("verified-skill");
    expect(items.some((item) => item.displayName === "Example Remote")).toBe(true);

    const githubMcpItems = items.filter((item) => item.displayName === "GitHub" && item.type === "mcp");
    expect(githubMcpItems).toHaveLength(1);
    expect(githubMcpItems[0]?.verified).toBe(true);

    const nextSkillItems = items.filter((item) => item.displayName === "Verified Skill" && item.type === "skill");
    expect(nextSkillItems).toHaveLength(1);
    expect(items.some((item) => item.type === "skill" && item.description?.includes("skills.sh"))).toBe(true);
  });

  it("builds a catalog summary without persisting when requested", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps: []
skills: []
workflowPacks: []
`);

    const fetchImpl: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "https://registry.modelcontextprotocol.io/v0.1/servers?limit=100") {
        return new Response(JSON.stringify({ servers: [], metadata: {} }), { status: 200 });
      }
      if (url === "https://www.skills.sh/official") {
        return new Response("<html><body></body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const summary = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).syncAll();

    expect(summary.totalItems).toBe(0);
    expect(summary.mcps.added).toBe(0);
    expect(summary.skills.added).toBe(0);
    expect(summary.rules.added).toBe(0);
    expect(summary.workflows.added).toBe(0);
    expect(summary.sourceErrors).toEqual([]);
  });

  it("continues syncing trusted sources when one upstream source fails", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps: []
skills: []
workflowPacks: []
`);

    const fetchImpl: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "https://registry.modelcontextprotocol.io/v0.1/servers?limit=100") {
        return new Response(JSON.stringify({
          servers: [
            {
              name: "io.github.example/example-remote",
              title: "Example Remote",
              remotes: [{ url: "https://example.com/mcp" }],
            },
          ],
          metadata: {},
        }), { status: 200 });
      }

      if (url === "https://www.skills.sh/official") {
        return new Response("unavailable", { status: 503 });
      }

      throw new Error(`Unexpected URL ${url}`);
    };

    const summary = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).syncAll();

    expect(summary.mcps.added).toBe(1);
    expect(summary.skills.added).toBe(0);
    expect(summary.totalItems).toBe(1);
    expect(summary.sourceErrors).toEqual([
      expect.objectContaining({ source: "skills-sh-official" }),
    ]);
  });
});
