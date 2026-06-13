import type {
  CatalogSeedItem,
  McpEntry,
  RuleEntry,
  SkillEntry,
  SourceCollectedItem,
  WorkflowPackEntry,
} from "./schemas";

export const DEFAULT_FETCH_TIMEOUT_MS = 10000;
export const DEFAULT_FETCH_RETRIES = 1;

export const hrefAttributePattern = /href="(\/[^"#?]+)"/g;
export const anchorPattern = /<a\b[^>]*href="([^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi;
export const officialSkillRepoPattern = /\{\\?"repo\\?":\\?"([^"]+)\\?",\\?"totalInstalls\\?":\d+,\\?"skills\\?":\[(.*?)\]\}/g;
export const officialSkillNamePattern = /\\?"name\\?":\\?"([^"]+)\\?"/g;
export const skillsShDirectoryEntryPattern = /"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":\d+(?:,"isOfficial":(true|false))?/g;
export const xmlLocPattern = /<loc>([^<]+)<\/loc>/g;
export const skillsShSkillUrlPattern = /^https:\/\/www\.skills\.sh\/([^/]+)\/([^/]+)\/([^/?#]+)\/?$/i;
export const CONTROL_AND_ZERO_WIDTH_PATTERN = /[\u0000-\u001f\u007f-\u009f\u200b-\u200d\u2060\ufeff]/g;
export const SKILL_REPO_MIRROR_SUFFIXES = [
  "-agent-skills",
  "-plugins",
  "-plugin",
  "-skills",
  "-skill",
] as const;

export function normalizeCatalogText(value: string, fallback = "") {
  const normalized = value
    .normalize("NFKC")
    .replace(CONTROL_AND_ZERO_WIDTH_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

export function normalizeSkillRepoFamily(repoPath: string) {
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

export function canonicalGithubRef(ref?: string) {
	const normalizedRef = normalizeCatalogText(ref ?? "").toLowerCase();
	if (!normalizedRef || normalizedRef === "main") {
		return "main";
	}

	return normalizedRef;
}

export function canonicalSkillsShMirrorKey(entry: SkillEntry) {
	if (entry.source.type !== "github") {
		return canonicalSkillKey(entry);
	}

	const pathKey = normalizeCatalogText(entry.source.path ?? "");
	const refKey = canonicalGithubRef(entry.source.ref);
	return `github-mirror:${normalizeSkillRepoFamily(entry.source.repo)}:${pathKey}:${refKey}`;
}

export function preferSkillMirrorCandidate(
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

export function slugify(value: string) {
  return normalizeCatalogText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function stableHash(input: string) {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function stripHtml(input: string) {
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

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function cleanEscapedValue(value: string) {
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

export function withVersion(identifier: string, version?: string) {
  if (!version || version === "latest") {
    return identifier;
  }
  return `${identifier}@${version}`;
}

export function compareSemver(a: string, b: string): number {
  const partsA = a.split(".").map((x) => parseInt(x, 10) || 0);
  const partsB = b.split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const valA = partsA[i] ?? 0;
    const valB = partsB[i] ?? 0;
    if (valA !== valB) {
      return valA - valB;
    }
  }
  return 0;
}

export function canonicalMcpKey(entry: McpEntry) {
  return JSON.stringify({
    runtime: entry.runtime,
    command: entry.command ?? "",
    args: entry.args,
    url: entry.url ?? "",
  });
}

export function officialMcpId(displayName: string, serverName: string, entry: Omit<McpEntry, "id">) {
  return `mcp-${slugify(displayName)}-${stableHash(`${serverName}:${canonicalMcpKey({
    ...entry,
    id: "mcp-temp",
  })}`).slice(0, 8)}`;
}

export function canonicalSkillKey(entry: SkillEntry) {
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

export function buildMcpCatalogItem(entry: McpEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
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

export function buildSkillCatalogItem(entry: SkillEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
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

export function buildRuleCatalogItem(entry: RuleEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
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

export function buildWorkflowCatalogItem(entry: WorkflowPackEntry, overrides: Partial<CatalogSeedItem> = {}): CatalogSeedItem {
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

export async function fetchWithTimeout(
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

export function toResult(items: CatalogSeedItem[]) {
  return {
    mcps: items.filter((item) => item.type === "mcp").length,
    skills: items.filter((item) => item.type === "skill").length,
    rules: items.filter((item) => item.type === "rule").length,
    workflows: items.filter((item) => item.type === "workflow").length,
  };
}

export function pickPreferredSkillMirror(
  a: { id: string; repo: string },
  b: { id: string; repo: string }
) {
  if (a.repo.length !== b.repo.length) {
    return a.repo.length < b.repo.length ? a : b;
  }
  return a.repo.localeCompare(b.repo) <= 0 ? a : b;
}
