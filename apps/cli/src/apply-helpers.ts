import type { Bundle } from "@vibebasket/core";

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
  if (flattened.files.length > 0 && !adapter.applyFiles) {
    unsupported.push("workflow files");
  }

  return unsupported;
}
