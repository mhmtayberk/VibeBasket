import fs from "node:fs/promises";
import type { IdeAdapter } from "@vibebasket/adapters";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "@vibebasket/core";
import {
  type FileVerificationTarget,
  extractConfiguredMcpIds,
  resolveRuleVerificationTargets,
  resolveSkillVerificationTargets,
} from "./config-inspection.js";

export interface FeatureVerificationResult {
  verified: boolean;
  checked: boolean;
  missingPaths: string[];
  missingMarkerIds: string[];
}

export interface InstallVerificationResult {
  ok: boolean;
  targetId: IdeId;
  displayName: string;
  configPath: string;
  missingMcpIds: string[];
  configReadable: boolean;
  skills: FeatureVerificationResult;
  rules: FeatureVerificationResult;
}

async function verifyFileTargets(
  targets: FileVerificationTarget[],
): Promise<FeatureVerificationResult> {
  if (targets.length === 0) {
    return {
      verified: true,
      checked: false,
      missingPaths: [],
      missingMarkerIds: [],
    };
  }

  const missingPaths: string[] = [];
  const missingMarkerIds = new Set<string>();

  for (const target of targets) {
    try {
      const content = await fs.readFile(target.path, "utf8");
      if (target.kind === "marker-file") {
        for (const markerId of target.markerIds ?? []) {
          if (!content.includes(`VIBEBASKET START: ${markerId}`)) {
            missingMarkerIds.add(markerId);
          }
        }
      }
    } catch {
      missingPaths.push(target.path);
      for (const markerId of target.markerIds ?? []) {
        missingMarkerIds.add(markerId);
      }
    }
  }

  return {
    verified: missingPaths.length === 0 && missingMarkerIds.size === 0,
    checked: true,
    missingPaths,
    missingMarkerIds: Array.from(missingMarkerIds),
  };
}

export async function verifyTargetInstall(
  targetId: IdeId,
  adapter: IdeAdapter,
  scope: Scope,
  projectRoot: string | undefined,
  expected: {
    mcps: McpEntry[];
    skills: SkillEntry[];
    rules: RuleEntry[];
  },
): Promise<InstallVerificationResult> {
  const configPath = adapter.configPath(scope, projectRoot);

  let readBackConfig: unknown = null;
  let configReadable = false;
  try {
    readBackConfig = await adapter.readConfig(scope, projectRoot);
    configReadable = true;
  } catch {
    configReadable = false;
  }

  const configuredMcpIds = configReadable
    ? new Set(extractConfiguredMcpIds(readBackConfig))
    : new Set<string>();
  const missingMcpIds = expected.mcps
    .map((item) => item.id)
    .filter((id) => !configuredMcpIds.has(id));

  const skills = await verifyFileTargets(
    resolveSkillVerificationTargets(targetId, scope, projectRoot, expected.skills),
  );
  const rules = await verifyFileTargets(
    resolveRuleVerificationTargets(targetId, scope, projectRoot, expected.rules),
  );

  return {
    ok: configReadable && missingMcpIds.length === 0 && skills.verified && rules.verified,
    targetId,
    displayName: adapter.displayName,
    configPath,
    missingMcpIds,
    configReadable,
    skills,
    rules,
  };
}

export function formatVerificationSummary(result: InstallVerificationResult): string {
  if (result.ok) {
    const checks: string[] = ["config readback ok", "MCP entries confirmed"];
    if (result.skills.checked) checks.push("skills confirmed");
    if (result.rules.checked) checks.push("rules confirmed");
    return checks.join(", ");
  }

  const issues: string[] = [];
  if (!result.configReadable) {
    issues.push("config readback failed");
  }
  if (result.missingMcpIds.length > 0) {
    issues.push(`missing MCPs: ${result.missingMcpIds.join(", ")}`);
  }
  if (result.skills.missingPaths.length > 0) {
    issues.push("skill artifacts missing");
  }
  if (result.skills.missingMarkerIds.length > 0) {
    issues.push(`missing skill markers: ${result.skills.missingMarkerIds.join(", ")}`);
  }
  if (result.rules.missingPaths.length > 0) {
    issues.push("rule artifacts missing");
  }
  if (result.rules.missingMarkerIds.length > 0) {
    issues.push(`missing rule markers: ${result.rules.missingMarkerIds.join(", ")}`);
  }
  return issues.join("; ");
}
