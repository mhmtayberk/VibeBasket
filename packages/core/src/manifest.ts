import { z } from "zod";

export const SCHEMA_VERSION = "0.1" as const;

export const IdeId = z.enum([
  "cursor",
  "windsurf",
  "claude-code",
  "claude-desktop",
  "vscode",
  "antigravity",
  "codex",
  "gemini-cli",
  "zed",
]);
export type IdeId = z.infer<typeof IdeId>;

export const Scope = z.enum(["user", "project"]);
export type Scope = z.infer<typeof Scope>;

export const Runtime = z.enum(["npx", "uvx", "docker", "remote", "node", "python"]);
export type Runtime = z.infer<typeof Runtime>;

export const McpEntry = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // unique within bundle
  catalogRef: z.string().optional(), // "official-registry:io.github.org/x"
  displayName: z.string(),
  runtime: Runtime,
  command: z.string().optional(), // e.g. "npx"
  args: z.array(z.string()).default([]),
  url: z.string().url().optional(), // for runtime=remote
  env: z.record(z.string()).default({}), // values may contain ${secret:NAME}
  requiredSecrets: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});
export type McpEntry = z.infer<typeof McpEntry>;

export const SkillEntry = z.object({
  id: z.string(),
  displayName: z.string(),
  source: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("github"),
      repo: z.string(),
      path: z.string().optional(),
      ref: z.string().default("main"),
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
export type SkillEntry = z.infer<typeof SkillEntry>;

export const RuleEntry = z.object({
  id: z.string(),
  displayName: z.string(),
  content: z.string(), // markdown body
  verified: z.boolean().default(false),
});
export type RuleEntry = z.infer<typeof RuleEntry>;

export const FileEntry = z.object({
  path: z.string(), // relative to project root or ${WORKSPACE}
  content: z.string(),
  ifExists: z.enum(["skip", "overwrite", "merge"]).default("skip"),
});
export type FileEntry = z.infer<typeof FileEntry>;

export const WorkflowPackEntry = z.object({
  id: z.string(), // e.g. "cline-memory-bank"
  displayName: z.string(),
  files: z.array(FileEntry).default([]),
  rules: z.array(RuleEntry).default([]),
  mcps: z.array(McpEntry).default([]),
  skills: z.array(SkillEntry).default([]),
});
export type WorkflowPackEntry = z.infer<typeof WorkflowPackEntry>;

export const Bundle = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(), // free-text, not authenticated
  scope: Scope, // applies to all selections in this bundle
  targets: z.array(IdeId).min(1),
  mcps: z.array(McpEntry).default([]),
  skills: z.array(SkillEntry).default([]),
  rules: z.array(RuleEntry).default([]),
  workflowPacks: z.array(WorkflowPackEntry).default([]),
});
export type Bundle = z.infer<typeof Bundle>;
