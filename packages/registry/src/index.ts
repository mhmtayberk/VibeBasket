import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const MCP_REGISTRY_BASE_URL = "https://registry.modelcontextprotocol.io/v0.1";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_VERIFIED_PATH = path.resolve(MODULE_DIR, "../data/verified.yaml");
const require = createRequire(import.meta.url);
const { load: parseYaml } = require("js-yaml") as {
  load: (input: string) => unknown;
};

export interface SyncResult {
  added: number;
  updated: number;
  errors: number;
}

export interface RegistrySyncSummary {
  mcps: SyncResult;
  skills: SyncResult;
  rules: SyncResult;
  workflows: SyncResult;
  totalItems: number;
  sourceErrors: Array<{ source: string; error: string }>;
}

export interface SyncOptions {
  fetchImpl?: typeof fetch;
  persist?: boolean;
  verifiedPath?: string;
}

type CatalogItemType = "mcp" | "skill" | "rule" | "workflow";

const RuntimeSchema = z.enum(["npx", "uvx", "docker", "remote", "node", "python"]);

const McpEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  catalogRef: z.string().optional(),
  displayName: z.string(),
  runtime: RuntimeSchema,
  command: z.string().optional(),
  args: z.array(z.string()).default([]),
  url: z.string().url().optional(),
  env: z.record(z.string()).default({}),
  requiredSecrets: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});
type McpEntry = z.infer<typeof McpEntrySchema>;

const SkillEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  source: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("github"),
      repo: z.string(),
      path: z.string().optional(),
      ref: z.string().default("main"),
    }),
    z.object({
      type: z.literal("npm"),
      package: z.string(),
      version: z.string().default("latest"),
    }),
    z.object({
      type: z.literal("inline"),
      content: z.string(),
    }),
  ]),
  verified: z.boolean().default(false),
});
type SkillEntry = z.infer<typeof SkillEntrySchema>;

const RuleEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  content: z.string(),
  verified: z.boolean().default(false),
});
type RuleEntry = z.infer<typeof RuleEntrySchema>;

const FileEntrySchema = z.object({
  path: z.string(),
  content: z.string(),
  ifExists: z.enum(["skip", "overwrite", "merge"]).default("skip"),
});

const WorkflowPackEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  files: z.array(FileEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]),
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
});
type WorkflowPackEntry = z.infer<typeof WorkflowPackEntrySchema>;

interface CatalogSeedItem {
  id: string;
  type: CatalogItemType;
  displayName: string;
  description?: string;
  icon?: string;
  verified: boolean;
  data: unknown;
}

interface SourceCollectedItem {
  canonicalKey: string;
  catalogItem: CatalogSeedItem;
  sourceName: string;
}

interface SourceCollector {
  name: string;
  collect(): Promise<SourceCollectedItem[]>;
}

interface CollectionRunResult {
  items: CatalogSeedItem[];
  errors: Array<{ source: string; error: string }>;
}

const mcpRegistryServerSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  remotes: z.array(z.object({
    url: z.string(),
  }).passthrough()).optional(),
  packages: z.array(z.object({
    registryType: z.string().optional(),
    identifier: z.string().optional(),
    version: z.string().optional(),
    transport: z.object({
      type: z.string().optional(),
    }).passthrough().optional(),
  }).passthrough()).optional(),
}).passthrough();

const mcpRegistryResponseSchema = z.object({
  servers: z.array(z.union([
    mcpRegistryServerSchema.extend({
      status: z.string().optional(),
    }),
    z.object({
      server: mcpRegistryServerSchema,
      _meta: z.record(z.object({
        status: z.string().optional(),
      }).passthrough()).optional(),
    }).passthrough(),
  ])),
  metadata: z.object({
    nextCursor: z.string().optional(),
  }).partial().optional(),
});
type McpRegistryServer = z.infer<typeof mcpRegistryServerSchema>;
type McpRegistryEntry = z.infer<typeof mcpRegistryResponseSchema>["servers"][number];

const verifiedCatalogSchema = z.object({
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]).optional(),
  workflowPacks: z.array(WorkflowPackEntrySchema).default([]),
});

const hrefAttributePattern = /href="(\/[^"#?]+)"/g;
const anchorPattern = /<a\b[^>]*href="([^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const officialSkillRepoPattern = /\{\\?"repo\\?":\\?"([^"]+)\\?",\\?"totalInstalls\\?":\d+,\\?"skills\\?":\[(.*?)\]\}/g;
const officialSkillNamePattern = /\\?"name\\?":\\?"([^"]+)\\?"/g;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function stableHash(input: string) {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function stripHtml(input: string) {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanEscapedValue(value: string) {
  return value.replace(/\\/g, "").trim();
}

function withVersion(identifier: string, version?: string) {
  if (!version || version === "latest") {
    return identifier;
  }
  return `${identifier}@${version}`;
}

function canonicalMcpKey(entry: McpEntry) {
  return JSON.stringify({
    runtime: entry.runtime,
    command: entry.command ?? "",
    args: entry.args,
    url: entry.url ?? "",
  });
}

function canonicalSkillKey(entry: SkillEntry) {
  if (entry.source.type === "github") {
    const pathKey = entry.source.path ? slugify(path.basename(entry.source.path)) : "";
    return `github:${entry.source.repo}:${pathKey}`;
  }

  if (entry.source.type === "npm") {
    return `npm:${entry.source.package}:${entry.source.version}`;
  }

  return `inline:${stableHash(entry.source.content)}`;
}

function buildMcpCatalogItem(entry: McpEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "mcp",
    displayName: overrides.displayName ?? entry.displayName,
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = overrides.description;
  if (overrides.icon) item.icon = overrides.icon;
  return item;
}

function buildSkillCatalogItem(entry: SkillEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "skill",
    displayName: overrides.displayName ?? entry.displayName,
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = overrides.description;
  if (overrides.icon) item.icon = overrides.icon;
  return item;
}

function buildRuleCatalogItem(entry: RuleEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "rule",
    displayName: overrides.displayName ?? entry.displayName,
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = overrides.description;
  if (overrides.icon) item.icon = overrides.icon;
  return item;
}

function buildWorkflowCatalogItem(entry: WorkflowPackEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "workflow",
    displayName: overrides.displayName ?? entry.displayName,
    verified: overrides.verified ?? false,
    data: entry,
  };
  if (overrides.description) item.description = overrides.description;
  if (overrides.icon) item.icon = overrides.icon;
  return item;
}

function toResult(items: CatalogSeedItem[]) {
  return {
    mcps: items.filter((item) => item.type === "mcp").length,
    skills: items.filter((item) => item.type === "skill").length,
    rules: items.filter((item) => item.type === "rule").length,
    workflows: items.filter((item) => item.type === "workflow").length,
  };
}

class VerifiedCatalogCollector implements SourceCollector {
  readonly name = "verified-catalog";

  constructor(private readonly verifiedPath: string) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const raw = await fs.readFile(this.verifiedPath, "utf8");
    const parsed = verifiedCatalogSchema.parse(parseYaml(raw));

    const items: SourceCollectedItem[] = [];

    for (const mcp of parsed.mcps) {
      items.push({
        canonicalKey: canonicalMcpKey(mcp),
        sourceName: this.name,
        catalogItem: buildMcpCatalogItem(mcp, { verified: true }),
      });
    }

    for (const skill of parsed.skills) {
      items.push({
        canonicalKey: canonicalSkillKey(skill),
        sourceName: this.name,
        catalogItem: buildSkillCatalogItem(skill, { verified: true }),
      });
    }

    for (const rule of parsed.rules ?? []) {
      items.push({
        canonicalKey: `rule:${rule.id}`,
        sourceName: this.name,
        catalogItem: buildRuleCatalogItem(rule, { verified: true }),
      });
    }

    for (const workflow of parsed.workflowPacks) {
      items.push({
        canonicalKey: `workflow:${workflow.id}`,
        sourceName: this.name,
        catalogItem: buildWorkflowCatalogItem(workflow, { verified: true }),
      });

      for (const rule of workflow.rules) {
        items.push({
          canonicalKey: `rule:${rule.id}`,
          sourceName: this.name,
          catalogItem: buildRuleCatalogItem(rule, { verified: true }),
        });
      }
    }

    return items;
  }
}

class OfficialMcpRegistryCollector implements SourceCollector {
  readonly name = "official-mcp-registry";

  constructor(private readonly fetchImpl: typeof fetch) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const items: SourceCollectedItem[] = [];
    let cursor: string | undefined;

    do {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) {
        params.set("cursor", cursor);
      }

      const res = await this.fetchImpl(`${MCP_REGISTRY_BASE_URL}/servers?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`MCP registry request failed: HTTP ${res.status}`);
      }

      const payload = mcpRegistryResponseSchema.parse(await res.json());

      for (const registryEntry of payload.servers) {
        const normalized = this.unwrapRegistryEntry(registryEntry);
        if (!normalized || normalized.status === "deleted") {
          continue;
        }

        const entry = this.normalizeRegistryServer(normalized.server);
        if (!entry) {
          continue;
        }

        const overrides: Partial<CatalogSeedItem> = { verified: false };
        if (normalized.server.description) {
          overrides.description = normalized.server.description;
        }

        items.push({
          canonicalKey: canonicalMcpKey(entry),
          sourceName: this.name,
          catalogItem: buildMcpCatalogItem(entry, overrides),
        });
      }

      cursor = payload.metadata?.nextCursor;
    } while (cursor);

    return items;
  }

  private unwrapRegistryEntry(registryEntry: McpRegistryEntry): {
    server: McpRegistryServer;
    status?: string;
  } {
    if ("server" in registryEntry) {
      const metaRecord = registryEntry._meta as
        | Record<string, { status?: string }>
        | undefined;
      const officialMeta = metaRecord?.["io.modelcontextprotocol.registry/official"];
      return {
        server: registryEntry.server as McpRegistryServer,
        status: officialMeta?.status,
      };
    }

    return {
      server: registryEntry,
      status: registryEntry.status,
    };
  }

  private normalizeRegistryServer(server: McpRegistryServer) {
    const remoteUrl = server.remotes?.find((remote) => {
      try {
        new URL(remote.url);
        return true;
      } catch {
        return false;
      }
    })?.url;
    const packageDefinition = server.packages?.find((pkg) => pkg.transport?.type === "stdio") ?? server.packages?.[0];
    const displayName = server.title ?? server.name.split("/").pop() ?? server.name;

    const suffix = stableHash(server.name).slice(0, 8);
    const entryBase = {
      id: `mcp-${slugify(displayName)}-${suffix}`,
      catalogRef: `mcp-registry:${server.name}`,
      displayName,
      env: {},
      requiredSecrets: [],
      verified: false,
    };

    if (remoteUrl) {
      return McpEntrySchema.parse({
        ...entryBase,
        runtime: "remote",
        url: remoteUrl,
      });
    }

    if (!packageDefinition?.identifier) {
      return null;
    }

    if (packageDefinition.registryType === "npm") {
      return McpEntrySchema.parse({
        ...entryBase,
        runtime: "npx",
        args: ["-y", withVersion(packageDefinition.identifier, packageDefinition.version)],
      });
    }

    if (packageDefinition.registryType === "pypi") {
      return McpEntrySchema.parse({
        ...entryBase,
        runtime: "uvx",
        args: [withVersion(packageDefinition.identifier, packageDefinition.version)],
      });
    }

    if (packageDefinition.registryType === "docker") {
      return McpEntrySchema.parse({
        ...entryBase,
        runtime: "docker",
        args: ["run", "--rm", withVersion(packageDefinition.identifier, packageDefinition.version)],
      });
    }

    return null;
  }
}

class SkillsShCuratedCollector implements SourceCollector {
  readonly name = "skills-sh-official";

  constructor(private readonly fetchImpl: typeof fetch) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const officialSkills = await this.fetchOfficialSkillEntries();
    const deduped = new Map<string, SourceCollectedItem>();

    for (const skill of officialSkills) {
      if (!deduped.has(skill.canonicalKey)) {
        deduped.set(skill.canonicalKey, skill);
      }
    }

    return Array.from(deduped.values());
  }

  private async fetchOfficialSkillEntries() {
    const html = await this.fetchText("https://www.skills.sh/official", "skills.sh official list");
    const items: SourceCollectedItem[] = [];
    const parsedFromBlob = this.parseOfficialSkillBlob(html);

    if (parsedFromBlob.length > 0) {
      return parsedFromBlob;
    }

    const repoPaths = new Set<string>();
    for (const match of html.matchAll(hrefAttributePattern)) {
      const href = match[1];
      if (!href) continue;
      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 2) continue;
      const [owner, repo] = segments;
      if (!owner || !repo || owner === "docs" || owner === "topic" || owner === "agent") continue;
      repoPaths.add(`${owner}/${repo}`);
    }

    for (const repoPath of repoPaths) {
      const repoSkills = await this.fetchRepoSkills(repoPath);
      for (const skill of repoSkills) {
        items.push(skill);
      }
    }

    return items;
  }

  private parseOfficialSkillBlob(html: string) {
    const items: SourceCollectedItem[] = [];

    for (const repoMatch of html.matchAll(officialSkillRepoPattern)) {
      const repoPath = cleanEscapedValue(repoMatch[1] ?? "");
      const skillsBlob = repoMatch[2];
      if (!repoPath || !skillsBlob) continue;

      const [owner, repo] = repoPath.split("/");
      if (!owner || !repo) continue;

      for (const skillMatch of skillsBlob.matchAll(officialSkillNamePattern)) {
        const skillSlug = cleanEscapedValue(skillMatch[1] ?? "");
        if (!skillSlug) continue;

        const entry = SkillEntrySchema.parse({
          id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
          displayName: titleFromSlug(skillSlug),
          source: {
            type: "github",
            repo: `${owner}/${repo}`,
            path: skillSlug,
            ref: "main",
          },
          verified: false,
        });

        items.push({
          canonicalKey: `github:${owner}/${repo}:${skillSlug}`,
          sourceName: this.name,
          catalogItem: buildSkillCatalogItem(entry, {
            description: `Official skill from ${owner}/${repo} on skills.sh`,
          }),
        });
      }
    }

    return items;
  }

  private async fetchRepoSkills(repoPath: string) {
    const html = await this.fetchText(`https://www.skills.sh/${repoPath}`, `skills.sh repo ${repoPath}`);
    const [owner, repo] = repoPath.split("/");
    const items: SourceCollectedItem[] = [];
    const seen = new Set<string>();

    for (const match of html.matchAll(anchorPattern)) {
      const href = match[1];
      const anchorText = stripHtml(match[2] ?? "");
      if (!href?.startsWith(`/${repoPath}/`)) continue;

      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 3) continue;

      const skillSlug = segments[2];
      if (!skillSlug || skillSlug === repo || seen.has(skillSlug)) continue;
      seen.add(skillSlug);

      const displayName = anchorText || titleFromSlug(skillSlug);
      const entry = SkillEntrySchema.parse({
        id: `skill-${slugify(owner ?? "")}-${slugify(repo ?? "")}-${slugify(skillSlug)}`,
        displayName,
        source: {
          type: "github",
          repo: `${owner}/${repo}`,
          path: skillSlug,
          ref: "main",
        },
        verified: false,
      });

      items.push({
        canonicalKey: `github:${owner}/${repo}:${skillSlug}`,
        sourceName: this.name,
        catalogItem: buildSkillCatalogItem(entry, {
          description: `Official skill from ${owner}/${repo} on skills.sh`,
        }),
      });
    }

    return items;
  }

  private async fetchText(url: string, label: string) {
    const res = await this.fetchImpl(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "VibeBasket Registry Sync/0.1 (+https://vibebasket.dev)",
      },
    });

    if (!res.ok) {
      throw new Error(`${label} request failed: HTTP ${res.status}`);
    }

    return res.text();
  }
}

export class RegistrySyncService {
  private readonly fetchImpl: typeof fetch;
  private readonly verifiedPath: string;
  private readonly persist: boolean;
  private readonly collectors: SourceCollector[];

  constructor(options: SyncOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.verifiedPath = options.verifiedPath ?? DEFAULT_VERIFIED_PATH;
    this.persist = options.persist ?? true;
    this.collectors = [
      new VerifiedCatalogCollector(this.verifiedPath),
      new OfficialMcpRegistryCollector(this.fetchImpl),
      new SkillsShCuratedCollector(this.fetchImpl),
    ];
  }

  async collectCatalogItems(): Promise<CatalogSeedItem[]> {
    const { items } = await this.runCollectors();
    return items;
  }

  private async runCollectors(): Promise<CollectionRunResult> {
    const deduped = new Map<string, SourceCollectedItem>();
    const errors: Array<{ source: string; error: string }> = [];

    for (const collector of this.collectors) {
      try {
        const items = await collector.collect();
        for (const item of items) {
          const existing = deduped.get(item.canonicalKey);
          if (!existing || item.catalogItem.verified) {
            deduped.set(item.canonicalKey, item);
          }
        }
      } catch (error) {
        errors.push({
          source: collector.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      items: Array.from(deduped.values()).map((item) => item.catalogItem),
      errors,
    };
  }

  async syncAll(): Promise<RegistrySyncSummary> {
    const { items, errors } = await this.runCollectors();

    if (this.persist) {
      await this.persistCatalog(items);
    }

    const counts = toResult(items);
    return {
      mcps: { added: counts.mcps, updated: 0, errors: 0 },
      skills: { added: counts.skills, updated: 0, errors: 0 },
      rules: { added: counts.rules, updated: 0, errors: 0 },
      workflows: { added: counts.workflows, updated: 0, errors: 0 },
      totalItems: items.length,
      sourceErrors: errors,
    };
  }

  private async persistCatalog(items: CatalogSeedItem[]) {
    if (items.length === 0) {
      return;
    }

    const loadCore = new Function("return import('@vibebasket/core')") as () => Promise<{
      db: any;
      catalogItems: any;
    }>;
    const [{ db, catalogItems }, { notInArray }] = await Promise.all([
      loadCore(),
      import("drizzle-orm"),
    ]);

    const ids = items.map((item) => item.id);

    for (const item of items) {
      await db.insert(catalogItems).values({
        id: item.id,
        type: item.type,
        displayName: item.displayName,
        description: item.description,
        icon: item.icon,
        verified: item.verified,
        data: item.data as any,
      }).onConflictDoUpdate({
        target: catalogItems.id,
        set: {
          type: item.type,
          displayName: item.displayName,
          description: item.description,
          icon: item.icon,
          verified: item.verified,
          data: item.data as any,
          createdAt: new Date(),
        },
      });
    }

    await db.delete(catalogItems).where(notInArray(catalogItems.id, ids));
  }
}
