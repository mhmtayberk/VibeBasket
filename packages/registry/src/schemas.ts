import { z } from "zod";

export type CatalogItemType = "mcp" | "skill" | "rule" | "workflow";

export const RuntimeSchema = z.enum(["npx", "uvx", "docker", "remote", "node", "python"]);
const ALLOWED_REMOTE_MCP_PROTOCOLS = new Set(["http:", "https:"]);

function isAllowedRemoteMcpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol.toLowerCase();
    return ALLOWED_REMOTE_MCP_PROTOCOLS.has(protocol);
  } catch {
    return false;
  }
}

export const McpEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  catalogRef: z.string().optional(),
  displayName: z.string(),
  runtime: RuntimeSchema,
  command: z.string().optional(),
  args: z.array(z.string()).default([]),
  url: z
    .string()
    .url()
    .refine(isAllowedRemoteMcpUrl, {
      message: "Remote MCP URLs must use http or https.",
    })
    .optional(),
  env: z.record(z.string()).default({}),
  headers: z.record(z.string()).default({}),
  requiredSecrets: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});
export type McpEntry = z.infer<typeof McpEntrySchema>;

export const SkillEntrySchema = z.object({
  id: z.string(),
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
  id: z.string(),
  displayName: z.string(),
  content: z.string(),
  verified: z.boolean().default(false),
});
export type RuleEntry = z.infer<typeof RuleEntrySchema>;

export const FileEntrySchema = z.object({
  path: z.string(),
  content: z.string(),
  ifExists: z.enum(["skip", "overwrite", "merge"]).default("skip"),
});

export const WorkflowPackEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  files: z.array(FileEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]),
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
});
export type WorkflowPackEntry = z.infer<typeof WorkflowPackEntrySchema>;

export interface CatalogSeedItem {
  id: string;
  type: CatalogItemType;
  displayName: string;
  description?: string;
  icon?: string;
  verified: boolean;
  sourceName?: string;
  sourceUrl?: string;
  data: unknown;
}

export interface SourceCollectedItem {
  canonicalKey: string;
  catalogItem: CatalogSeedItem;
  sourceName: string;
}

export interface SourceCollector {
  name: string;
  collect(): Promise<SourceCollectedItem[]>;
}

export interface CollectionRunResult {
  items: CatalogSeedItem[];
  errors: Array<{ source: string; error: string }>;
  sourceRuns: Array<{
    source: string;
    ok: boolean;
    itemCount: number;
    durationMs: number;
    error?: string;
  }>;
}

export const mcpRegistryServerSchema = z
  .object({
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    remotes: z
      .array(
        z
          .object({
            url: z.string(),
            headers: z
              .array(
                z
                  .object({
                    name: z.string(),
                    description: z.string().optional(),
                    isRequired: z.boolean().optional(),
                    isSecret: z.boolean().optional(),
                  })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
    packages: z
      .array(
        z
          .object({
            registryType: z.string().optional(),
            identifier: z.string().optional(),
            version: z.string().optional(),
            transport: z
              .object({
                type: z.string().optional(),
              })
              .passthrough()
              .optional(),
            environmentVariables: z
              .array(
                z
                  .object({
                    name: z.string(),
                    description: z.string().optional(),
                    placeholder: z.string().optional(),
                    isSecret: z.boolean().optional(),
                  })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const mcpRegistryResponseSchema = z.object({
  servers: z.array(
    z.union([
      mcpRegistryServerSchema.extend({
        status: z.string().optional(),
      }),
      z
        .object({
          server: mcpRegistryServerSchema,
          _meta: z
            .record(
              z
                .object({
                  status: z.string().optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough(),
    ]),
  ),
  metadata: z
    .object({
      nextCursor: z.string().optional(),
    })
    .partial()
    .optional(),
});
export type McpRegistryServer = z.infer<typeof mcpRegistryServerSchema>;
export type McpRegistryEntry = z.infer<typeof mcpRegistryResponseSchema>["servers"][number];

export const verifiedCatalogSchema = z.object({
  mcps: z.array(McpEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
  rules: z.array(RuleEntrySchema).default([]).optional(),
  workflowPacks: z.array(WorkflowPackEntrySchema).default([]),
});
