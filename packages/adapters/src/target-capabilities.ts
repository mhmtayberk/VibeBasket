import type { IdeId, Scope } from "@vibebasket/core";
import type { IdeAdapterCapabilities } from "./types";

export interface TargetCapabilityDescriptor extends IdeAdapterCapabilities {
  readonly autoApply: boolean;
}

type TargetCapabilityRegistry = Record<IdeId, TargetCapabilityDescriptor>;

function defineCapabilities(
  capabilities: TargetCapabilityRegistry
): TargetCapabilityRegistry {
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
    supportsSkills: false,
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
    supportedScopes: ["user"],
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
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  "gemini-cli": {
    supportsMcp: true,
    supportsSkills: false,
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
    supportsSkills: false,
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
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  zed: {
    supportsMcp: true,
    supportsSkills: false,
    supportsRules: false,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  roocode: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["project"],
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
    supportsMcp: false,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["project"],
    autoApply: true,
  },
  void: {
    supportsMcp: true,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["user", "project"],
    autoApply: true,
  },
  aider: {
    supportsMcp: false,
    supportsSkills: true,
    supportsRules: true,
    supportedScopes: ["project"],
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
