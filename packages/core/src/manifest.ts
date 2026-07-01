import { z } from "zod";

export const SCHEMA_VERSION = "0.1" as const;
const ALLOWED_REMOTE_MCP_PROTOCOLS = new Set(["http:", "https:"]);

export function isAllowedRemoteMcpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol.toLowerCase();
    return ALLOWED_REMOTE_MCP_PROTOCOLS.has(protocol);
  } catch {
    return false;
  }
}

export const IdeIdSchema = z.enum([
  "cursor",
  "windsurf",
  "claude-code",
  "vscode",
  "antigravity",
  "deepseek-tui",
  "codex",
  "gemini-cli",
  "zed",
  "junie",
  "kiro",
  "cline-cli",
  "continue",
  "roocode",
  "hermes",
  "openclaw",
  "github-copilot",
  "void",
  "aider",
  "cortex-code",
  "goose",
  "ibm-bob",
  "codebuddy",
  "opencode",
]);
export type IdeId = z.infer<typeof IdeIdSchema>;

export const ScopeSchema = z.enum(["user", "project"]);
export type Scope = z.infer<typeof ScopeSchema>;

export const RuntimeSchema = z.enum(["npx", "uvx", "docker", "remote", "node", "python"]);
export type Runtime = z.infer<typeof RuntimeSchema>;

export const McpEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // unique within bundle
  catalogRef: z.string().optional(), // "official-registry:io.github.org/x"
  displayName: z.string(),
  runtime: RuntimeSchema,
  command: z.string().optional(), // e.g. "npx"
  args: z.array(z.string()).default([]),
  url: z
    .string()
    .url()
    .refine(isAllowedRemoteMcpUrl, {
      message: "Remote MCP URLs must use http or https.",
    })
    .optional(), // for runtime=remote
  env: z.record(z.string()).default({}), // values may contain ${secret:NAME}
  headers: z.record(z.string()).default({}), // remote MCP header values may contain ${secret:NAME}
  requiredSecrets: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});
export type McpEntry = z.infer<typeof McpEntrySchema>;

export const SkillEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string(),
  source: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("github"),
      repo: z.string(),
      path: z.string().optional(),
      ref: z.string().optional(),
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
export type SkillEntry = z.infer<typeof SkillEntrySchema>;

export const RuleEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string(),
  content: z.string(), // markdown body
  verified: z.boolean().default(false),
});
export type RuleEntry = z.infer<typeof RuleEntrySchema>;

export const FileEntrySchema = z.object({
  path: z.string().regex(/^(?!\/|\\|\.\.)[a-zA-Z0-9_/.-]+$/), // relative only, no LFI/path traversal
  content: z.string(),
  ifExists: z.enum(["skip", "overwrite", "merge"]).default("skip"),
});
export type FileEntry = z.infer<typeof FileEntrySchema>;

export const WorkflowPackEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // e.g. "cline-memory-bank"
  displayName: z.string(),
  files: z.array(FileEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]),
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
});
export type WorkflowPackEntry = z.infer<typeof WorkflowPackEntrySchema>;

export const BundleSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(), // free-text, not authenticated
  scope: ScopeSchema, // applies to all selections in this bundle
  targets: z.array(IdeIdSchema).min(1),
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]),
  workflowPacks: z.array(WorkflowPackEntrySchema).default([]),
});
export type Bundle = z.infer<typeof BundleSchema>;
