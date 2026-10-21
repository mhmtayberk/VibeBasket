import type { IdeId, Scope } from "../../core/src/manifest.js";
import { type IdeAdapterCapabilities, getFeatureScopes } from "./types";

export interface TargetCapabilityDescriptor extends IdeAdapterCapabilities {
  readonly autoApply: boolean;
}

type TargetCapabilityRegistry = Record<IdeId, TargetCapabilityDescriptor>;

function defineCapabilities(capabilities: TargetCapabilityRegistry): TargetCapabilityRegistry {
  return capabilities;
}

export const TARGET_CAPABILITIES = defineCapabilities({
  antigravity: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  "claude-code": {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  "cline-cli": {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user"],
    autoApply: true,
  },
  "deepseek-tui": {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user"],
    autoApply: true,
  },
  codex: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  continue: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  cursor: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  "gemini-cli": {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  junie: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  kiro: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  vscode: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  windsurf: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  zed: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  roocode: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  hermes: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["project"],
    autoApply: true,
  },
  openclaw: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["project"],
    autoApply: true,
  },
  "github-copilot": {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["project"],
    autoApply: true,
  },
  void: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user"],
    autoApply: true,
  },
  aider: {
    supportsMcp: false,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["project"],
    autoApply: true,
  },
  "cortex-code": {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  goose: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user"],
    autoApply: true,
  },
  "ibm-bob": {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  codebuddy: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  opencode: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  ante: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    mcpScopes: ["user"],
    skillScopes: ["user", "project"],
    autoApply: true,
  },
  trae: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    mcpScopes: ["project"],
    skillScopes: ["user", "project"],
    ruleScopes: ["project"],
    autoApply: true,
  },
  qoder: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    ruleScopes: ["project"],
    autoApply: true,
  },
  omp: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  autohand: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  crush: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
});

export const SUPPORTED_TARGET_IDS = Object.entries(TARGET_CAPABILITIES)
  .filter(([, capability]) => capability.autoApply)
  .map(([id]) => id as IdeId);

export function getTargetCapabilities(id: IdeId): TargetCapabilityDescriptor {
  return TARGET_CAPABILITIES[id];
}

export function targetSupportsScope(id: IdeId, scope: Scope): boolean {
  return TARGET_CAPABILITIES[id].supportedScopes.includes(scope);
}

export function targetSupportsFeatureScope(
  id: IdeId,
  feature: "mcp" | "skills" | "rules",
  scope: Scope,
): boolean {
  return getFeatureScopes(TARGET_CAPABILITIES[id], feature).includes(scope);
}
