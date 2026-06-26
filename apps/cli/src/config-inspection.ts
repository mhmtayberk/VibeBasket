import os from "node:os";
import path from "node:path";
import type { IdeId, RuleEntry, Scope, SkillEntry } from "../../../packages/core/src/manifest.js";

function getWindowsRoamingDir() {
  return process.env.APPDATA?.trim() || path.join(os.homedir(), "AppData", "Roaming");
}

function getXdgConfigHome() {
  return process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config");
}

function getVsCodeGlobalStorageDir(extensionId: string) {
  const platform = os.platform();

  if (platform === "darwin") {
    return path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "Code",
      "User",
      "globalStorage",
      extensionId,
      "settings",
    );
  }

  if (platform === "win32") {
    return path.join(
      getWindowsRoamingDir(),
      "Code",
      "User",
      "globalStorage",
      extensionId,
      "settings",
    );
  }

  return path.join(getXdgConfigHome(), "Code", "User", "globalStorage", extensionId, "settings");
}

function getRooCodeGlobalBaseDir() {
  return path.dirname(getVsCodeGlobalStorageDir("RooVeterinaryInc.roo-cline"));
}

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

  const mcpServersValue = record.mcpServers;
  if (Array.isArray(mcpServersValue)) {
    return mcpServersValue
      .map((entry) => asRecord(entry))
      .flatMap((entry) => {
        const name = entry?.name;
        return typeof name === "string" && name.trim() ? [name] : [];
      });
  }

  const candidates = [
    getObjectKeyRecord(record, "mcpServers"),
    getObjectKeyRecord(record, "mcp"),
    getObjectKeyRecord(record, "mcp_servers"),
    getObjectKeyRecord(record, "mcp.servers"),
    getObjectKeyRecord(record, "context_servers"),
    getObjectKeyRecord(record, "extensions"),
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
    case "cursor": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".cursor", "skills")
          : path.join(home, ".cursor", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "gemini-cli": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".gemini", "skills")
          : path.join(home, ".gemini", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "kiro": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".kiro", "skills")
          : path.join(home, ".kiro", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "windsurf": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".windsurf", "skills")
          : path.join(home, ".codeium", "windsurf", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "zed": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".agents", "skills")
          : path.join(home, ".agents", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
    case "roocode":
      return skills.map((skill) => ({
        path:
          scope === "project" && projectRoot
            ? path.join(projectRoot, ".roo", "skills", skill.id, "SKILL.md")
            : path.join(getRooCodeGlobalBaseDir(), "skills", skill.id, "SKILL.md"),
        kind: "file",
      }));
    case "opencode": {
      const baseDir =
        scope === "project" && projectRoot
          ? path.join(projectRoot, ".opencode", "skills")
          : path.join(getXdgConfigHome(), "opencode", "skills");
      return skills.map((skill) => ({
        path: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "file",
      }));
    }
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
    case "windsurf":
      return scope === "project" && projectRoot
        ? rules.map((rule) => ({
            path: path.join(projectRoot, ".devin", "rules", `${rule.id}.md`),
            kind: "file",
          }))
        : [
            {
              path: path.join(home, ".codeium", "windsurf", "memories", "global_rules.md"),
              kind: "marker-file",
              markerIds: rules.map((rule) => rule.id),
            },
          ];
    case "roocode":
      return rules.map((rule) => ({
        path:
          scope === "project" && projectRoot
            ? path.join(projectRoot, ".roo", "rules", `${rule.id}.md`)
            : path.join(getRooCodeGlobalBaseDir(), "rules", `${rule.id}.md`),
        kind: "file",
      }));
    case "opencode":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, "AGENTS.md")
              : path.join(getXdgConfigHome(), "opencode", "AGENTS.md"),
          kind: "marker-file",
          markerIds: rules.map((rule) => rule.id),
        },
      ];
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
    case "cursor":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".cursor", "skills")
              : path.join(home, ".cursor", "skills"),
          kind: "directory",
        },
      ];
    case "gemini-cli":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".gemini", "skills")
              : path.join(home, ".gemini", "skills"),
          kind: "directory",
        },
      ];
    case "kiro":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".kiro", "skills")
              : path.join(home, ".kiro", "skills"),
          kind: "directory",
        },
      ];
    case "windsurf":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".windsurf", "skills")
              : path.join(home, ".codeium", "windsurf", "skills"),
          kind: "directory",
        },
      ];
    case "zed":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".agents", "skills")
              : path.join(home, ".agents", "skills"),
          kind: "directory",
        },
      ];
    case "roocode":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".roo", "skills")
              : path.join(getRooCodeGlobalBaseDir(), "skills"),
          kind: "directory",
        },
      ];
    case "opencode":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".opencode", "skills")
              : path.join(getXdgConfigHome(), "opencode", "skills"),
          kind: "directory",
        },
      ];
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
    case "windsurf":
      return scope === "project" && projectRoot
        ? [
            {
              path: path.join(projectRoot, ".devin", "rules"),
              kind: "directory",
              fileExtension: ".md",
            },
          ]
        : [
            {
              path: path.join(home, ".codeium", "windsurf", "memories", "global_rules.md"),
              kind: "marker-file",
            },
          ];
    case "roocode":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, ".roo", "rules")
              : path.join(getRooCodeGlobalBaseDir(), "rules"),
          kind: "directory",
          fileExtension: ".md",
        },
      ];
    case "opencode":
      return [
        {
          path:
            scope === "project" && projectRoot
              ? path.join(projectRoot, "AGENTS.md")
              : path.join(getXdgConfigHome(), "opencode", "AGENTS.md"),
          kind: "marker-file",
        },
      ];
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
