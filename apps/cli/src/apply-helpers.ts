import type { Bundle } from "@vibebasket/core";

export interface FlattenedBundleContent {
  mcps: Bundle["mcps"];
  skills: Bundle["skills"];
  rules: Bundle["rules"];
  files: Array<Bundle["workflowPacks"][number]["files"][number]>;
}

export interface AdapterLike {
  displayName: string;
  applySkills?: unknown;
  applyRules?: unknown;
  applyFiles?: unknown;
}

export function flattenBundleContent(bundle: Bundle): FlattenedBundleContent {
  return {
    mcps: [...bundle.mcps, ...bundle.workflowPacks.flatMap((workflow) => workflow.mcps)],
    skills: [...bundle.skills, ...bundle.workflowPacks.flatMap((workflow) => workflow.skills)],
    rules: [...bundle.rules, ...bundle.workflowPacks.flatMap((workflow) => workflow.rules)],
    files: bundle.workflowPacks.flatMap((workflow) => workflow.files),
  };
}

export function getUnsupportedTargetContent(
  adapter: AdapterLike,
  flattened: FlattenedBundleContent,
): string[] {
  const unsupported: string[] = [];

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
