import { McpEntrySchema, SkillEntrySchema } from "@vibebasket/core";
import type { McpEntry, SkillEntry } from "@vibebasket/core";

export interface SyncResult {
  added: number;
  updated: number;
  errors: number;
}

export interface Fetcher {
  name: string;
  fetchMcps(): Promise<McpEntry[]>;
  fetchSkills(): Promise<SkillEntry[]>;
}

export class GitHubMcpFetcher implements Fetcher {
  name = "GitHub Official MCP";

  async fetchMcps(): Promise<McpEntry[]> {
    return [
      {
        id: "mcp-official-postgres",
        displayName: "PostgreSQL (Official)",
        runtime: "npx",
        command: "@modelcontextprotocol/server-postgres",
        args: ["postgresql://localhost/mydb"],
        env: {},
        requiredSecrets: ["DATABASE_URL"],
        verified: true,
      },
      {
        id: "mcp-official-github",
        displayName: "GitHub (Official)",
        runtime: "npx",
        command: "@modelcontextprotocol/server-github",
        args: [],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${secret:GITHUB_TOKEN}" },
        requiredSecrets: ["GITHUB_TOKEN"],
        verified: true,
      }
    ];
  }

  async fetchSkills(): Promise<SkillEntry[]> {
    return [];
  }
}

export class SkillsShFetcher implements Fetcher {
  name = "skills.sh";

  async fetchMcps(): Promise<McpEntry[]> {
    return [];
  }

  async fetchSkills(): Promise<SkillEntry[]> {
    return [
      {
        id: "skill-sh-nextjs",
        displayName: "Next.js Best Practices",
        source: {
          type: "github",
          repo: "mastra-ai/skills",
          path: "nextjs-best-practices",
        },
        verified: true,
      }
    ];
  }
}

export class RegistrySyncService {
  private fetchers: Fetcher[] = [];

  constructor() {
    this.fetchers.push(new GitHubMcpFetcher());
    this.fetchers.push(new SkillsShFetcher());
  }

  async syncAll(): Promise<{ mcps: SyncResult; skills: SyncResult }> {
    const mcpsResult: SyncResult = { added: 0, updated: 0, errors: 0 };
    const skillsResult: SyncResult = { added: 0, updated: 0, errors: 0 };
    
    const mcpsByCommand = new Map<string, McpEntry>();
    const skillsByRepo = new Map<string, SkillEntry>();
    
    for (const fetcher of this.fetchers) {
      try {
        const mcps = await fetcher.fetchMcps();
        for (const mcp of mcps) {
          const valid = McpEntrySchema.safeParse(mcp);
          if (valid.success) {
            // De-duplicate by command to avoid same server from different registries
            if (!mcp.command || !mcpsByCommand.has(mcp.command)) {
              if (mcp.command) mcpsByCommand.set(mcp.command, valid.data);
              mcpsResult.added++;
            } else {
              mcpsResult.updated++;
            }
          } else {
            console.error(`[Sync] Invalid MCP from ${fetcher.name}:`, valid.error.format());
            mcpsResult.errors++;
          }
        }

        const skills = await fetcher.fetchSkills();
        for (const skill of skills) {
          const valid = SkillEntrySchema.safeParse(skill);
          if (valid.success) {
            const skillKey = skill.source.type === "github" ? skill.source.repo : skill.id;
            if (!skillsByRepo.has(skillKey)) {
              skillsByRepo.set(skillKey, valid.data);
              skillsResult.added++;
            } else {
              skillsResult.updated++;
            }
          } else {
            console.error(`[Sync] Invalid Skill from ${fetcher.name}:`, valid.error.format());
            skillsResult.errors++;
          }
        }
      } catch (err) {
        console.error(`[Sync] Fetcher ${fetcher.name} failed:`, err);
      }
    }

    return {
      mcps: mcpsResult,
      skills: skillsResult,
    };
  }
}
