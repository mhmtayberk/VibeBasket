import os from "node:os";
import path from "node:path";
import type { IdeId, RuleEntry, Scope, SkillEntry } from "@vibebasket/core";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getObjectKeyRecord(
  config: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = config[key];
  return asRecord(value);
}

export function extractConfiguredMcpIds(config: unknown): string[] {
  const record = asRecord(config);
  if (!record) return [];

  const candidates = [
    getObjectKeyRecord(record, "mcpServers"),
    getObjectKeyRecord(record, "mcp_servers"),
    getObjectKeyRecord(record, "mcp.servers"),
    getObjectKeyRecord(record, "context_servers"),
  ].filter(Boolean) as Array<Record<string, unknown>>;

  for (const candidate of candidates) {
    return Object.keys(candidate);
  }

  return [];
}

export interface FileVerificationTarget {
  path: string;
  kind: "directory" | "file" | "marker-file";
  markerIds?: string[];
}

export interface InventoryTarget {
  path: string;
  kind: "directory" | "marker-file";
  fileExtension?: string;
}

export function resolveSkillVerificationTargets(
  targetId: IdeId,
  scope: Scope,
  projectRoot?: string,
  skills: SkillEntry[] = [],
): FileVerificationTarget[] {
  const home = os.homedir();

  switch (targetId) {
    case "claude-code": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".claude", "skills")
          : path.join(home, ".claude", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "continue": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".continue", "prompts")
          : path.join(home, ".continue", "prompts");
      return skills.map((skill) => ({
        path: path.join(baseDir, `${skill.id}.prompt`),
        kind: "file",
      }));
    }
    case "cortex-code": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".cortex", "skills")
          : path.join(home, ".snowflake", "cortex", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, `${skill.id}.md`),
        kind: "file",
      }));
    }
    case "ibm-bob": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".bob", "skills")
          : path.join(home, ".bob", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, `${skill.id}.md`),
        kind: "file",
      }));
    }
    case "codebuddy": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".codebuddy", "skills")
          : path.join(home, ".codebuddy", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, `${skill.id}.md`),
        kind: "file",
      }));
    }
    case "roocode":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".clinerules"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    case "hermes":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".hermesrules"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    case "openclaw":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".openclawrules"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    case "void":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".voidrules"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
            {
              path: path.join(projectRoot, ".clinerules"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    case "github-copilot":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".github", "copilot-instructions.md"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    case "aider":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".aiderinstructions.md"),
              kind: "marker-file",
              markerIds: skills.map((skill) => skill.id),
            },
          ]
        : [];
    default:
      return [];
  }
}

export function resolveRuleVerificationTargets(
  targetId: IdeId,
  scope: Scope,
  projectRoot?: string,
  rules: RuleEntry[] = [],
): FileVerificationTarget[] {
  const home = os.homedir();

  switch (targetId) {
    case "cursor": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".cursor", "rules")
          : path.join(home, ".cursor", "rules");
      return rules.map((rule) => ({
        path: path.join(baseDir, `${rule.id}.md`),
        kind: "file",
      }));
    }
    case "roocode":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".clinerules"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    case "hermes":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".hermesrules"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    case "openclaw":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".openclawrules"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    case "void":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".voidrules"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
            {
              path: path.join(projectRoot, ".clinerules"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    case "github-copilot":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".github", "copilot-instructions.md"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    case "aider":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".aiderinstructions.md"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ]
        : [];
    default:
      return [];
  }
}

export function resolveSkillInventoryTargets(
  targetId: IdeId,
  scope: Scope,
  projectRoot?: string,
): InventoryTarget[] {
  const home = os.homedir();

  switch (targetId) {
    case "claude-code":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".claude", "skills")
              : path.join(home, ".claude", "skills"),
          kind: "directory",
        },
      ];
    case "continue":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".continue", "prompts")
              : path.join(home, ".continue", "prompts"),
          kind: "directory",
          fileExtension: ".prompt",
        },
      ];
    case "cortex-code":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".cortex", "skills")
              : path.join(home, ".snowflake", "cortex", "skills"),
          kind: "directory",
          fileExtension: ".md",
        },
      ];
    case "ibm-bob":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".bob", "skills")
              : path.join(home, ".bob", "skills"),
          kind: "directory",
          fileExtension: ".md",
        },
      ];
    case "codebuddy":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".codebuddy", "skills")
              : path.join(home, ".codebuddy", "skills"),
          kind: "directory",
          fileExtension: ".md",
        },
      ];
    case "roocode":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".clinerules"), kind: "marker-file" }]
        : [];
    case "hermes":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".hermesrules"), kind: "marker-file" }]
        : [];
    case "openclaw":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".openclawrules"), kind: "marker-file" }]
        : [];
    case "void":
      return projectRoot
        ? [
            { path: path.join(projectRoot, ".voidrules"), kind: "marker-file" },
            { path: path.join(projectRoot, ".clinerules"), kind: "marker-file" },
          ]
        : [];
    case "github-copilot":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".github", "copilot-instructions.md"),
              kind: "marker-file",
            },
          ]
        : [];
    case "aider":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".aiderinstructions.md"), kind: "marker-file" }]
        : [];
    default:
      return [];
  }
}

export function resolveRuleInventoryTargets(
  targetId: IdeId,
  scope: Scope,
  projectRoot?: string,
): InventoryTarget[] {
  const home = os.homedir();

  switch (targetId) {
    case "cursor":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".cursor", "rules")
              : path.join(home, ".cursor", "rules"),
          kind: "directory",
          fileExtension: ".md",
        },
      ];
    case "roocode":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".clinerules"), kind: "marker-file" }]
        : [];
    case "hermes":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".hermesrules"), kind: "marker-file" }]
        : [];
    case "openclaw":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".openclawrules"), kind: "marker-file" }]
        : [];
    case "void":
      return projectRoot
        ? [
            { path: path.join(projectRoot, ".voidrules"), kind: "marker-file" },
            { path: path.join(projectRoot, ".clinerules"), kind: "marker-file" },
          ]
        : [];
    case "github-copilot":
      return projectRoot
        ? [
            {
              path: path.join(projectRoot, ".github", "copilot-instructions.md"),
              kind: "marker-file",
            },
          ]
        : [];
    case "aider":
      return projectRoot
        ? [{ path: path.join(projectRoot, ".aiderinstructions.md"), kind: "marker-file" }]
        : [];
    default:
      return [];
  }
}
