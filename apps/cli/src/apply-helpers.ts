import type { IdeAdapter } from "@vibebasket/adapters";
import type { Bundle, IdeId, McpEntry } from "../../../packages/core/src/manifest.js";

export interface FlattenedBundleContent {
  mcps: Bundle["mcps"];
  skills: Bundle["skills"];
  rules: Bundle["rules"];
  files: Array<Bundle["workflowPacks"][number]["files"][number]>;
}

export interface AdapterLike {
  displayName: string;
  supportsMcp?: boolean;
  applySkills?: unknown;
  applyRules?: unknown;
  applyFiles?: unknown;
}

export interface McpSkipReason {
  id: string;
  displayName: string;
  reason: string;
}

export interface TargetMcpApplyPlan {
  supported: McpEntry[];
  skipped: McpSkipReason[];
  requiredSecrets: string[];
  credentialNotice: string | null;
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

export function flattenBundleContent(bundle: Bundle): FlattenedBundleContent {
  return {
    mcps: dedupeByKey(
      [...bundle.mcps, ...bundle.workflowPacks.flatMap((workflow) => workflow.mcps)],
      (item) => item.id,
    ),
    skills: dedupeByKey(
      [...bundle.skills, ...bundle.workflowPacks.flatMap((workflow) => workflow.skills)],
      (item) => item.id,
    ),
    rules: dedupeByKey(
      [...bundle.rules, ...bundle.workflowPacks.flatMap((workflow) => workflow.rules)],
      (item) => item.id,
    ),
    files: dedupeByKey(
      bundle.workflowPacks.flatMap((workflow) => workflow.files),
      (item) => item.path.trim().toLowerCase(),
    ),
  };
}

export function getUnsupportedTargetContent(
  adapter: AdapterLike,
  flattened: FlattenedBundleContent,
): string[] {
  const unsupported: string[] = [];

  if (flattened.mcps.length > 0 && adapter.supportsMcp === false) {
    unsupported.push("MCPs");
  }
  if (flattened.skills.length > 0 && !adapter.applySkills) {
    unsupported.push("skills");
  }
  if (flattened.rules.length > 0 && !adapter.applyRules) {
    unsupported.push("rules");
  }

  return unsupported;
}

const SECRET_PLACEHOLDER_PATTERN = /\$\{secret:([A-Z0-9_:-]+)\}/gi;

export function extractSecretNames(value: string): string[] {
  const matches = Array.from(value.matchAll(SECRET_PLACEHOLDER_PATTERN), (match) => match[1] ?? "");
  return matches.filter(Boolean);
}

export function collectRequiredSecretsForMcp(mcp: McpEntry): string[] {
  return Array.from(
    new Set([
      ...mcp.requiredSecrets,
      ...Object.values(mcp.env).flatMap(extractSecretNames),
      ...Object.values(mcp.headers ?? {}).flatMap(extractSecretNames),
    ]),
  );
}

function hasRemoteSecretHeaders(mcp: McpEntry) {
  return (
    mcp.runtime === "remote" &&
    Object.values(mcp.headers ?? {}).some((value) => extractSecretNames(value).length > 0)
  );
}

function resolveCredentialNotice(targetId: IdeId, mcps: McpEntry[]): string | null {
  const requiresSecrets = mcps.some((mcp) => collectRequiredSecretsForMcp(mcp).length > 0);
  if (!requiresSecrets) {
    return null;
  }

  if (targetId === "codex" && mcps.some(hasRemoteSecretHeaders)) {
    return "Credential note: Codex preserves supported remote header secrets as environment-key references when possible; other secret values are still resolved locally on this machine.";
  }

  return "Credential note: secret values are resolved locally on this machine and then written into the target's local config surface when the IDE requires inline env/header values.";
}

export function buildTargetMcpApplyPlan(
  targetId: IdeId,
  adapter: IdeAdapter,
  mcps: McpEntry[],
): TargetMcpApplyPlan {
  if (!adapter.supportsMcp) {
    return {
      supported: [],
      skipped: mcps.map((mcp) => ({
        id: mcp.id,
        displayName: mcp.displayName,
        reason: "target does not support MCP configuration",
      })),
      requiredSecrets: [],
      credentialNotice: null,
    };
  }

  const supported: McpEntry[] = [];
  const skipped: McpSkipReason[] = [];

  for (const mcp of mcps) {
    if (mcp.runtime === "remote" && !mcp.url) {
      skipped.push({
        id: mcp.id,
        displayName: mcp.displayName,
        reason: "remote MCP entry is missing a URL",
      });
      continue;
    }

    supported.push(mcp);
  }

  return {
    supported,
    skipped,
    requiredSecrets: Array.from(new Set(supported.flatMap(collectRequiredSecretsForMcp))),
    credentialNotice: resolveCredentialNotice(targetId, supported),
  };
}
