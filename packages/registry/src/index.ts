import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { z } from "zod";

const MCP_REGISTRY_BASE_URL = "https://registry.modelcontextprotocol.io/v0.1";
const DEFAULT_FETCH_TIMEOUT_MS = 10000;
const DEFAULT_MCP_REGISTRY_FETCH_TIMEOUT_MS = 30000;
const DEFAULT_FETCH_RETRIES = 1;
const PERSIST_BATCH_SIZE = 250;
const PRUNE_BATCH_SIZE = 500;
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const CORE_SOURCE_ENTRY_URL = pathToFileURL(
  path.resolve(MODULE_DIR, "../../core/src/index.ts")
).href;
const DEFAULT_VERIFIED_PATH = path.resolve(MODULE_DIR, "../data/verified.yaml");
const require = createRequire(import.meta.url);
const { load: parseYaml } = require("js-yaml") as {
  load: (input: string) => unknown;
};
const dynamicImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T>(specifier: string) => Promise<T>;

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
  trigger?: string;
  fetchRetries?: number;
  mcpRegistryTimeoutMs?: number;
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
      ref: z.string().optional(),
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
  sourceName?: string;
  sourceUrl?: string;
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

async function loadCoreModule<T>() {
  try {
    return await dynamicImport<T>("@vibebasket/core");
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    return dynamicImport<T>(CORE_SOURCE_ENTRY_URL);
  }
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
const skillsShDirectoryEntryPattern = /"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":\d+(?:,"isOfficial":(true|false))?/g;
const xmlLocPattern = /<loc>([^<]+)<\/loc>/g;
const skillsShSkillUrlPattern = /^https:\/\/www\.skills\.sh\/([^/]+)\/([^/]+)\/([^/?#]+)\/?$/i;
const CONTROL_AND_ZERO_WIDTH_PATTERN = /[\u0000-\u001f\u007f-\u009f\u200b-\u200d\u2060\ufeff]/g;
const SKILL_REPO_MIRROR_SUFFIXES = [
  "-agent-skills",
  "-plugins",
  "-plugin",
  "-skills",
  "-skill",
] as const;

function normalizeCatalogText(value: string, fallback = "") {
  const normalized = value
    .normalize("NFKC")
    .replace(CONTROL_AND_ZERO_WIDTH_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function normalizeSkillRepoFamily(repoPath: string) {
  const normalizedRepoPath = normalizeCatalogText(repoPath).toLowerCase();
  const [owner, repo = ""] = normalizedRepoPath.split("/", 2);
  let family = repo;

  for (const suffix of SKILL_REPO_MIRROR_SUFFIXES) {
    if (family.endsWith(suffix) && family.length > suffix.length) {
      family = family.slice(0, -suffix.length);
      break;
    }
  }

	return `${owner}/${family || repo}`;
}

function canonicalGithubRef(ref?: string) {
	const normalizedRef = normalizeCatalogText(ref ?? "").toLowerCase();
	if (!normalizedRef || normalizedRef === "main") {
		return "main";
	}

	return normalizedRef;
}

function canonicalSkillsShMirrorKey(entry: SkillEntry) {
	if (entry.source.type !== "github") {
		return canonicalSkillKey(entry);
	}

	const pathKey = normalizeCatalogText(entry.source.path ?? "");
	const refKey = canonicalGithubRef(entry.source.ref);
	return `github-mirror:${normalizeSkillRepoFamily(entry.source.repo)}:${pathKey}:${refKey}`;
}

function preferSkillMirrorCandidate(
  candidate: SourceCollectedItem,
  existing: SourceCollectedItem | undefined
) {
  if (!existing) {
    return candidate;
  }

  if (candidate.catalogItem.verified && !existing.catalogItem.verified) {
    return candidate;
  }

  if (!candidate.catalogItem.verified && existing.catalogItem.verified) {
    return existing;
  }

  const candidateRepo = candidate.catalogItem.data as SkillEntry;
  const existingRepo = existing.catalogItem.data as SkillEntry;
  const candidateRepoName =
    candidateRepo.source.type === "github" ? normalizeCatalogText(candidateRepo.source.repo) : "";
  const existingRepoName =
    existingRepo.source.type === "github" ? normalizeCatalogText(existingRepo.source.repo) : "";

  if (candidateRepoName.length !== existingRepoName.length) {
    return candidateRepoName.length < existingRepoName.length ? candidate : existing;
  }

  return candidateRepoName.localeCompare(existingRepoName) < 0 ? candidate : existing;
}

function slugify(value: string) {
  return normalizeCatalogText(value)
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
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\")
    .replace(/\\+$/g, "")
    .trim();
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

function officialMcpId(displayName: string, serverName: string, entry: Omit<McpEntry, "id">) {
  return `mcp-${slugify(displayName)}-${stableHash(`${serverName}:${canonicalMcpKey({
    ...entry,
    id: "mcp-temp",
  })}`).slice(0, 8)}`;
}

function canonicalSkillKey(entry: SkillEntry) {
	if (entry.source.type === "github") {
		const pathKey = normalizeCatalogText(entry.source.path ?? "");
		const refKey = canonicalGithubRef(entry.source.ref);
		return `github:${entry.source.repo.toLowerCase()}:${pathKey}:${refKey}`;
	}

  if (entry.source.type === "npm") {
    return `npm:${entry.source.package.toLowerCase()}:${entry.source.version.toLowerCase()}`;
  }

  return `inline:${stableHash(entry.source.content)}`;
}

function buildMcpCatalogItem(entry: McpEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "mcp",
    displayName: normalizeCatalogText(overrides.displayName ?? entry.displayName, entry.id),
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = normalizeCatalogText(overrides.description);
  if (overrides.icon) item.icon = overrides.icon;
  if (overrides.sourceName) item.sourceName = overrides.sourceName;
  if (overrides.sourceUrl) item.sourceUrl = overrides.sourceUrl;
  return item;
}

function buildSkillCatalogItem(entry: SkillEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "skill",
    displayName: normalizeCatalogText(overrides.displayName ?? entry.displayName, entry.id),
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = normalizeCatalogText(overrides.description);
  if (overrides.icon) item.icon = overrides.icon;
  if (overrides.sourceName) item.sourceName = overrides.sourceName;
  if (overrides.sourceUrl) item.sourceUrl = overrides.sourceUrl;
  return item;
}

function buildRuleCatalogItem(entry: RuleEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "rule",
    displayName: normalizeCatalogText(overrides.displayName ?? entry.displayName, entry.id),
    verified: overrides.verified ?? entry.verified,
    data: entry,
  };
  if (overrides.description) item.description = normalizeCatalogText(overrides.description);
  if (overrides.icon) item.icon = overrides.icon;
  if (overrides.sourceName) item.sourceName = overrides.sourceName;
  if (overrides.sourceUrl) item.sourceUrl = overrides.sourceUrl;
  return item;
}

function buildWorkflowCatalogItem(entry: WorkflowPackEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
  const item: CatalogSeedItem = {
    id: overrides.id ?? entry.id,
    type: "workflow",
    displayName: normalizeCatalogText(overrides.displayName ?? entry.displayName, entry.id),
    verified: overrides.verified ?? false,
    data: entry,
  };
  if (overrides.description) item.description = normalizeCatalogText(overrides.description);
  if (overrides.icon) item.icon = overrides.icon;
  if (overrides.sourceName) item.sourceName = overrides.sourceName;
  if (overrides.sourceUrl) item.sourceUrl = overrides.sourceUrl;
  return item;
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  input: string,
  init: RequestInit,
  label: string,
  options: {
    timeoutMs?: number;
    retries?: number;
  } = {}
) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_FETCH_RETRIES;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetchImpl(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof Error && error.name === "AbortError";
      const isLastAttempt = attempt === retries;

      if (isAbort && !isLastAttempt) {
        attempt += 1;
        continue;
      }

      if (isAbort) {
        throw new Error(
          `${label} timed out after ${timeoutMs}ms${retries > 0 ? ` (retried ${retries} time${retries === 1 ? "" : "s"})` : ""}`
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${label} failed`);
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
        catalogItem: buildMcpCatalogItem(mcp, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const skill of parsed.skills) {
      items.push({
        canonicalKey: canonicalSkillKey(skill),
        sourceName: this.name,
        catalogItem: buildSkillCatalogItem(skill, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const rule of parsed.rules ?? []) {
      items.push({
        canonicalKey: `rule:${rule.id}`,
        sourceName: this.name,
        catalogItem: buildRuleCatalogItem(rule, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const workflow of parsed.workflowPacks) {
      items.push({
        canonicalKey: `workflow:${workflow.id}`,
        sourceName: this.name,
        catalogItem: buildWorkflowCatalogItem(workflow, {
          verified: true,
          sourceName: this.name,
        }),
      });

      for (const rule of workflow.rules) {
        items.push({
          canonicalKey: `rule:${rule.id}`,
          sourceName: this.name,
          catalogItem: buildRuleCatalogItem(rule, {
            verified: true,
            sourceName: this.name,
          }),
        });
      }
    }

    return items;
  }
}

class OfficialMcpRegistryCollector implements SourceCollector {
  readonly name = "official-mcp-registry";

  constructor(
    private readonly fetchImpl: typeof fetch,
    private readonly timeoutMs: number,
    private readonly retries: number
  ) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const items: SourceCollectedItem[] = [];
    let cursor: string | undefined;

    do {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) {
        params.set("cursor", cursor);
      }

      const res = await fetchWithTimeout(
        this.fetchImpl,
        `${MCP_REGISTRY_BASE_URL}/servers?${params.toString()}`,
        {
          headers: {
            accept: "application/json",
            "user-agent": "VibeBasket Registry Sync/0.1 (+https://vibebasket.dev)",
          },
        },
        `MCP registry request`,
        {
          timeoutMs: this.timeoutMs,
          retries: this.retries,
        }
      );
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
        overrides.sourceName = this.name;
        overrides.sourceUrl = `${MCP_REGISTRY_BASE_URL}/servers`;

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
      return officialMeta?.status
        ? {
            server: registryEntry.server as McpRegistryServer,
            status: officialMeta.status,
          }
        : {
            server: registryEntry.server as McpRegistryServer,
          };
    }

    return registryEntry.status
      ? {
          server: registryEntry,
          status: registryEntry.status,
        }
      : {
          server: registryEntry,
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

    const entryBase = {
      catalogRef: `mcp-registry:${server.name}`,
      displayName,
      args: [],
      env: {},
      requiredSecrets: [],
      verified: false,
    };

    if (remoteUrl) {
      const entry = {
        ...entryBase,
        runtime: "remote",
        url: remoteUrl,
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (!packageDefinition?.identifier) {
      return null;
    }

    if (packageDefinition.registryType === "npm") {
      const entry = {
        ...entryBase,
        runtime: "npx",
        args: ["-y", withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (packageDefinition.registryType === "pypi") {
      const entry = {
        ...entryBase,
        runtime: "uvx",
        args: [withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (packageDefinition.registryType === "docker") {
      const entry = {
        ...entryBase,
        runtime: "docker",
        args: ["run", "--rm", withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    return null;
  }
}

class SkillsShCuratedCollector implements SourceCollector {
  readonly name = "skills-sh-directory";

  constructor(
    private readonly fetchImpl: typeof fetch,
    private readonly retries: number
  ) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const officialRepoPaths = await this.fetchOfficialRepoPaths();
    const officialSkills = await this.fetchDirectorySkillEntries(officialRepoPaths);
    const deduped = new Map<string, SourceCollectedItem>();
    const mirrorDeduped = new Map<string, SourceCollectedItem>();

    for (const skill of officialSkills) {
      if (!deduped.has(skill.canonicalKey)) {
        deduped.set(skill.canonicalKey, skill);
      }
    }

    for (const skill of deduped.values()) {
      const skillData = skill.catalogItem.data as SkillEntry;
      const mirrorKey = canonicalSkillsShMirrorKey(skillData);
      mirrorDeduped.set(
        mirrorKey,
        preferSkillMirrorCandidate(skill, mirrorDeduped.get(mirrorKey))
      );
    }

    return Array.from(mirrorDeduped.values());
  }

  private async fetchDirectorySkillEntries(officialRepoPaths: Set<string>) {
    const sitemapEntries = await this.fetchSkillsFromSitemaps(officialRepoPaths);
    if (sitemapEntries.length > 0) {
      return sitemapEntries;
    }

    const html = await this.fetchText("https://www.skills.sh/", "skills.sh directory");
    const normalizedHtml = html.replace(/\\"/g, '"');
    const items = this.parseDirectorySkillBlob(normalizedHtml);

    if (items.length > 0) {
      return items;
    }

    return this.fetchOfficialSkillEntries(officialRepoPaths);
  }

  private parseDirectorySkillBlob(html: string) {
    const items: SourceCollectedItem[] = [];

    for (const match of html.matchAll(skillsShDirectoryEntryPattern)) {
      const repoPath = normalizeCatalogText(match[1] ?? "");
      const skillSlug = normalizeCatalogText(match[2] ?? "");
      const parsedName = normalizeCatalogText(cleanEscapedValue(match[3] ?? ""));
      const displayName =
        !parsedName || parsedName.toLowerCase() === skillSlug.toLowerCase()
          ? titleFromSlug(skillSlug)
          : parsedName;
      const isOfficial = (match[4] ?? "") === "true";

      const [owner, repo] = repoPath.split("/");
      if (!owner || !repo || !skillSlug) {
        continue;
      }

      const entry = SkillEntrySchema.parse({
        id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
        displayName,
        source: {
          type: "github",
          repo: `${owner}/${repo}`,
          path: skillSlug,
        },
        verified: false,
      });

      const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";
      const skillUrl = `https://www.skills.sh/${owner}/${repo}/${skillSlug}`;

      items.push({
        canonicalKey: canonicalSkillKey(entry),
        sourceName,
        catalogItem: buildSkillCatalogItem(entry, {
          description: `${isOfficial ? "Official" : "Community"} skill from ${owner}/${repo} on skills.sh`,
          sourceName,
          sourceUrl: skillUrl,
        }),
      });
    }

    return items;
  }

  private async fetchOfficialRepoPaths() {
    const html = await this.fetchText("https://www.skills.sh/official", "skills.sh official list");
    const repoPaths = new Set<string>();

    for (const repoMatch of html.matchAll(officialSkillRepoPattern)) {
      const repoPath = cleanEscapedValue(repoMatch[1] ?? "");
      if (repoPath) {
        repoPaths.add(repoPath.toLowerCase());
      }
    }

    for (const match of html.matchAll(hrefAttributePattern)) {
      const href = match[1];
      if (!href) continue;
      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 2) continue;
      const [owner, repo] = segments;
      if (!owner || !repo || owner === "docs" || owner === "topic" || owner === "agent") continue;
      repoPaths.add(`${owner}/${repo}`.toLowerCase());
    }

    return repoPaths;
  }

  private async fetchSkillsFromSitemaps(officialRepoPaths: Set<string>) {
    const sitemapIndex = await this.fetchText("https://www.skills.sh/sitemap.xml", "skills.sh sitemap index");
    const sitemapUrls = Array.from(sitemapIndex.matchAll(xmlLocPattern))
      .map((match) => normalizeCatalogText(match[1] ?? ""))
      .filter((url) => url.includes("sitemap-skills-"));

    const items: SourceCollectedItem[] = [];

    for (const sitemapUrl of sitemapUrls) {
      const xml = await this.fetchText(sitemapUrl, `skills.sh sitemap ${sitemapUrl.split("/").pop() ?? sitemapUrl}`);
      for (const match of xml.matchAll(xmlLocPattern)) {
        const skillUrl = normalizeCatalogText(match[1] ?? "");
        const parsed = skillUrl.match(skillsShSkillUrlPattern);
        if (!parsed) {
          continue;
        }

        const [, owner, repo, skillSlug] = parsed;
        if (!owner || !repo || !skillSlug) {
          continue;
        }

        const repoPath = `${owner}/${repo}`;
        const isOfficial = officialRepoPaths.has(repoPath.toLowerCase());
        const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";
        const displayName = titleFromSlug(skillSlug);
        const entry = SkillEntrySchema.parse({
          id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
          displayName,
          source: {
            type: "github",
            repo: repoPath,
            path: skillSlug,
          },
          verified: false,
        });

        items.push({
          canonicalKey: canonicalSkillKey(entry),
          sourceName,
          catalogItem: buildSkillCatalogItem(entry, {
            description: `${isOfficial ? "Official" : "Community"} skill from ${repoPath} on skills.sh`,
            sourceName,
            sourceUrl: skillUrl,
          }),
        });
      }
    }

    return items;
  }

  private async fetchOfficialSkillEntries(officialRepoPaths: Set<string>) {
    const html = await this.fetchText("https://www.skills.sh/official", "skills.sh official list");
    const items: SourceCollectedItem[] = [];
    const parsedFromBlob = this.parseOfficialSkillBlob(html);

    if (parsedFromBlob.length > 0) {
      return parsedFromBlob;
    }

    for (const repoPath of officialRepoPaths) {
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
          },
          verified: false,
        });

        items.push({
          canonicalKey: canonicalSkillKey(entry),
          sourceName: this.name,
          catalogItem: buildSkillCatalogItem(entry, {
            description: `Official skill from ${owner}/${repo} on skills.sh`,
            sourceName: this.name,
            sourceUrl: "https://www.skills.sh/official",
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
        },
        verified: false,
      });

      items.push({
        canonicalKey: canonicalSkillKey(entry),
        sourceName: this.name,
        catalogItem: buildSkillCatalogItem(entry, {
          description: `Official skill from ${owner}/${repo} on skills.sh`,
          sourceName: this.name,
          sourceUrl: `https://www.skills.sh/${repoPath}`,
        }),
      });
    }

    return items;
  }

  private async fetchText(url: string, label: string) {
    const res = await fetchWithTimeout(
      this.fetchImpl,
      url,
      {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "VibeBasket Registry Sync/0.1 (+https://vibebasket.dev)",
        },
      },
      label,
      {
        retries: this.retries,
      }
    );

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
  private readonly trigger: string;
  private readonly fetchRetries: number;
  private readonly mcpRegistryTimeoutMs: number;
  private readonly collectors: SourceCollector[];

  constructor(options: SyncOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.verifiedPath = options.verifiedPath ?? DEFAULT_VERIFIED_PATH;
    this.persist = options.persist ?? true;
    this.trigger = options.trigger ?? "runtime";
    this.fetchRetries = options.fetchRetries ?? DEFAULT_FETCH_RETRIES;
    this.mcpRegistryTimeoutMs = options.mcpRegistryTimeoutMs ?? DEFAULT_MCP_REGISTRY_FETCH_TIMEOUT_MS;
    this.collectors = [
      new VerifiedCatalogCollector(this.verifiedPath),
      new OfficialMcpRegistryCollector(this.fetchImpl, this.mcpRegistryTimeoutMs, this.fetchRetries),
      new SkillsShCuratedCollector(this.fetchImpl, this.fetchRetries),
    ];
  }

  async collectCatalogItems(): Promise<CatalogSeedItem[]> {
    const { items } = await this.runCollectors();
    return items;
  }

  async collectVerifiedCatalogItems(): Promise<CatalogSeedItem[]> {
    const items = await new VerifiedCatalogCollector(this.verifiedPath).collect();
    return items.map((item) => item.catalogItem);
  }

  async seedVerifiedCatalog(): Promise<number> {
    const items = await this.collectVerifiedCatalogItems();
    if (this.persist) {
      await this.persistCatalog(items, { pruneMissing: false });
    }
    return items.length;
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
    const startedAt = new Date();
    const { items, errors } = await this.runCollectors();

    if (this.persist) {
      await this.persistCatalog(items, { pruneMissing: errors.length === 0 });
    }

    const counts = toResult(items);
    const summary = {
      mcps: { added: counts.mcps, updated: 0, errors: 0 },
      skills: { added: counts.skills, updated: 0, errors: 0 },
      rules: { added: counts.rules, updated: 0, errors: 0 },
      workflows: { added: counts.workflows, updated: 0, errors: 0 },
      totalItems: items.length,
      sourceErrors: errors,
    } satisfies RegistrySyncSummary;

    if (this.persist) {
      await this.recordSyncRun(summary, startedAt, new Date());
    }

    return summary;
  }

  private async persistCatalog(items: CatalogSeedItem[], opts: { pruneMissing?: boolean } = {}) {
    if (items.length === 0) {
      return;
    }

    const { db, catalogItems } = await loadCoreModule<{
      db: any;
      catalogItems: any;
    }>();
    const [{ inArray }] = await Promise.all([
      import("drizzle-orm"),
    ]);

    const ids = items.map((item) => item.id);
    const syncTime = new Date();

    for (let start = 0; start < items.length; start += PERSIST_BATCH_SIZE) {
      const chunk = items.slice(start, start + PERSIST_BATCH_SIZE);

      await db.insert(catalogItems).values(
        chunk.map((item) => ({
          id: item.id,
          type: item.type,
          displayName: item.displayName,
          description: item.description,
          icon: item.icon,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          verified: item.verified,
          data: item.data as any,
          firstSeenAt: syncTime,
          lastSeenAt: syncTime,
          lastSyncedAt: syncTime,
          createdAt: syncTime,
        }))
      ).onConflictDoUpdate({
        target: catalogItems.id,
        set: {
          type: sql.raw("excluded.type"),
          displayName: sql.raw("excluded.display_name"),
          description: sql.raw("excluded.description"),
          icon: sql.raw("excluded.icon"),
          sourceName: sql.raw("excluded.source_name"),
          sourceUrl: sql.raw("excluded.source_url"),
          verified: sql.raw("excluded.verified"),
          data: sql.raw("excluded.data"),
          firstSeenAt: sql`coalesce(${catalogItems.firstSeenAt}, excluded.first_seen_at)`,
          lastSeenAt: sql.raw("excluded.last_seen_at"),
          lastSyncedAt: sql.raw("excluded.last_synced_at"),
          createdAt: sql.raw("excluded.created_at"),
        },
      });
    }

    if (opts.pruneMissing) {
      const incomingIds = new Set(ids);
      const existingRows = await db.select({ id: catalogItems.id }).from(catalogItems);
      const staleIds = existingRows
        .map((row: { id: string }) => row.id)
        .filter((id: string) => !incomingIds.has(id));

      for (let start = 0; start < staleIds.length; start += PRUNE_BATCH_SIZE) {
        const chunk = staleIds.slice(start, start + PRUNE_BATCH_SIZE);
        await db.delete(catalogItems).where(inArray(catalogItems.id, chunk));
      }

      await db.delete(catalogItems).where(sql`${catalogItems.sourceName} is null`);
    }
  }

  private async recordSyncRun(summary: RegistrySyncSummary, startedAt: Date, completedAt: Date) {
    const { db, catalogSyncRuns, ensureDatabaseIndexes } = await loadCoreModule<{
      db: any;
      catalogSyncRuns: any;
      ensureDatabaseIndexes: () => Promise<void>;
    }>();

    await ensureDatabaseIndexes();
    await db.insert(catalogSyncRuns).values({
      trigger: this.trigger,
      success: summary.sourceErrors.length === 0,
      totalItems: summary.totalItems,
      mcps: summary.mcps.added,
      skills: summary.skills.added,
      rules: summary.rules.added,
      workflows: summary.workflows.added,
      durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
      sourceErrors: summary.sourceErrors,
      startedAt,
      completedAt,
    });
  }
}
