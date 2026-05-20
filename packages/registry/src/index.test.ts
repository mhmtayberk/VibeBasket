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
      ["https://www.skills.sh/", `
        <html>
          <body>
            <script>
              self.__next_f.push([1,"{\\"source\\":\\"vercel-labs/agent-skills\\",\\"skillId\\":\\"next-js-development\\",\\"name\\":\\"next-js-development\\",\\"installs\\":99,\\"isOfficial\\":true}"]);
              self.__next_f.push([1,"{\\"source\\":\\"copycat/skills\\",\\"skillId\\":\\"next-js-development\\",\\"name\\":\\"next-js-development\\",\\"installs\\":10}"]);
            </script>
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
      if (url === "https://www.skills.sh/") {
        return new Response("<html><body></body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
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
      mcpRegistryTimeoutMs: 10,
      fetchRetries: 0,
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

      if (url === "https://www.skills.sh/") {
        return new Response("unavailable", { status: 503 });
      }

      throw new Error(`Unexpected URL ${url}`);
    };

    const summary = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
      mcpRegistryTimeoutMs: 10,
      fetchRetries: 0,
    }).syncAll();

    expect(summary.mcps.added).toBe(1);
    expect(summary.skills.added).toBe(0);
    expect(summary.totalItems).toBe(1);
    expect(summary.sourceErrors).toEqual([
      expect.objectContaining({ source: "skills-sh-directory" }),
    ]);
  });

  it("generates distinct ids for multiple official MCP variants with the same registry name", async () => {
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
              name: "io.github.example/shared",
              title: "Shared MCP",
              packages: [
                {
                  registryType: "npm",
                  identifier: "@example/shared-mcp",
                  version: "1.0.0",
                  transport: { type: "stdio" },
                },
              ],
            },
            {
              name: "io.github.example/shared",
              title: "Shared MCP",
              packages: [
                {
                  registryType: "npm",
                  identifier: "@example/shared-mcp",
                  version: "2.0.0",
                  transport: { type: "stdio" },
                },
              ],
            },
          ],
          metadata: {},
        }), { status: 200 });
      }
      if (url === "https://www.skills.sh/") {
        return new Response("<html><body></body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const items = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).collectCatalogItems();

    const mcps = items.filter((item) => item.type === "mcp");
    expect(mcps).toHaveLength(2);
    expect(new Set(mcps.map((item) => item.id)).size).toBe(2);
  });

  it("surfaces a timeout error for one source while continuing with other trusted sources", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps: []
skills: []
workflowPacks: []
`);

    const fetchImpl: typeof fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "https://registry.modelcontextprotocol.io/v0.1/servers?limit=100") {
        return await new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const abortError = new Error("aborted");
            abortError.name = "AbortError";
            reject(abortError);
          });
        });
      }

      if (url === "https://www.skills.sh/") {
        return new Response(`
          <html>
            <body>
              <script>
                self.__next_f.push([1,"{\\"source\\":\\"copycat/skills\\",\\"skillId\\":\\"next-js-development\\",\\"name\\":\\"next-js-development\\",\\"installs\\":10}"]);
              </script>
            </body>
          </html>
        `, {
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
      mcpRegistryTimeoutMs: 10,
      fetchRetries: 0,
    }).syncAll();

    expect(summary.skills.added).toBe(1);
    expect(summary.mcps.added).toBe(0);
    expect(summary.sourceErrors).toEqual([
      expect.objectContaining({
        source: "official-mcp-registry",
        error: expect.stringContaining("timed out"),
      }),
    ]);
  }, 10000);

  it("keeps distinct github skills when the same repo contains nested skill paths with the same basename", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps: []
skills:
  - id: nested-skill-a
    displayName: Platform Skill Creator
    source:
      type: github
      repo: acme/skills
      path: platform/skill-creator
      ref: main
    verified: true
  - id: nested-skill-b
    displayName: Product Skill Creator
    source:
      type: github
      repo: acme/skills
      path: product/skill-creator
      ref: main
    verified: true
workflowPacks: []
`);

    const fetchImpl: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "https://registry.modelcontextprotocol.io/v0.1/servers?limit=100") {
        return new Response(JSON.stringify({ servers: [], metadata: {} }), { status: 200 });
      }
      if (url === "https://www.skills.sh/") {
        return new Response("<html><body></body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const items = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).collectCatalogItems();

    const skills = items.filter((item) => item.type === "skill");
    expect(skills).toHaveLength(2);
    expect(new Set(skills.map((item) => item.id)).size).toBe(2);
  });

  it("collapses official skills.sh mirror repos that expose the same owner/path skill", async () => {
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
      if (url === "https://www.skills.sh/") {
        return new Response(`
          <html>
            <body>
              <script>
                self.__next_f.push([1,"{\\"source\\":\\"anthropics/financial-services\\",\\"skillId\\":\\"3-statement-model\\",\\"name\\":\\"3-statement-model\\",\\"installs\\":100,\\"isOfficial\\":true}"]);
                self.__next_f.push([1,"{\\"source\\":\\"anthropics/financial-services-plugins\\",\\"skillId\\":\\"3-statement-model\\",\\"name\\":\\"3-statement-model\\",\\"installs\\":90,\\"isOfficial\\":true}"]);
              </script>
            </body>
          </html>
        `, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const items = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).collectCatalogItems();

    const matchingSkills = items.filter((item) => item.type === "skill" && item.displayName === "3 Statement Model");
    expect(matchingSkills).toHaveLength(1);
    expect(matchingSkills[0]?.id).toBe("skill-anthropics-financial-services-3-statement-model");
  });

  it("normalizes display names by removing control and zero-width characters", async () => {
    const verifiedPath = await createVerifiedCatalog(`
mcps:
skills: []
workflowPacks: []
`);

    const fetchImpl: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "https://registry.modelcontextprotocol.io/v0.1/servers?limit=100") {
        return new Response(JSON.stringify({
          servers: [
            {
              name: "io.github.example/strange-mcp",
              title: "  Strange\u200b MCP  ",
              remotes: [{ url: "https://example.com/mcp" }],
            },
          ],
          metadata: {},
        }), { status: 200 });
      }
      if (url === "https://www.skills.sh/") {
        return new Response(`
          <html>
            <body>
              <script>
                self.__next_f.push([1,"{\\"source\\":\\"acme/skills\\",\\"skillId\\":\\"skill-creator\\",\\"name\\":\\"Skill\\u0007 Creator\\",\\"installs\\":3}"]);
              </script>
            </body>
          </html>
        `, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const items = await new RegistrySyncService({
      fetchImpl,
      persist: false,
      verifiedPath,
    }).collectCatalogItems();

    expect(items.find((item) => item.type === "mcp")?.displayName).toBe("Strange MCP");
    expect(items.find((item) => item.type === "skill")?.displayName).toBe("Skill Creator");
  });
});
