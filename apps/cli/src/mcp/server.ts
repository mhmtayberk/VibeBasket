import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { IdeIdSchema, ScopeSchema } from "../../../../packages/core/src/manifest.js";
import { enforceToolPolicy } from "./policy.js";
import { VibebasketMcpServices } from "./services.js";
import { SelectionInputSchema, type McpToolEnvelope } from "./types.js";
import { restoreBackupByPath } from "../services/rollback-service.js";

function toolText<T extends Record<string, unknown>>(payload: McpToolEnvelope<T>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError: !payload.ok,
  };
}

function success<T extends Record<string, unknown>>(
  data: T,
  warnings: string[] = [],
  nextStepHint?: string,
): McpToolEnvelope<T> {
  return { ok: true, data, warnings, ...(nextStepHint ? { nextStepHint } : {}) };
}

function failure<T extends Record<string, unknown>>(
  errorCode: string,
  message: string,
  data: T,
  nextStepHint?: string,
): McpToolEnvelope<T> {
  return {
    ok: false,
    data,
    warnings: [message],
    errorCode,
    ...(nextStepHint ? { nextStepHint } : {}),
  };
}

const SearchInputSchema = z.object({
  query: z.string().trim().min(1).max(120),
  type: z.enum(["mcp", "skill", "rule", "workflow"]).optional(),
  trust: z.enum(["all", "verified", "official", "community"]).optional(),
  freshness: z.enum(["all", "fresh", "recent", "aging"]).optional(),
  sort: z.enum(["recommended", "freshest", "name"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

const GetItemInputSchema = z.object({
  id: z.string().trim().min(1),
});

const InstallApplyInputSchema = z
  .object({
    bundleUrl: z.string().url().optional(),
    selection: SelectionInputSchema.optional(),
    force: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.bundleUrl || value.selection), {
    message: "Provide either bundleUrl or selection.",
  });

const LocalStackLoadSchema = z.object({
  stackId: z.string().trim().regex(/^[a-z0-9-]+$/),
});

const SaveLocalStackSchema = SelectionInputSchema.extend({
  name: z.string().trim().min(1).max(80),
});

const TargetSetupGuideSchema = z.object({
  targetId: IdeIdSchema,
  scope: ScopeSchema.optional(),
});

const TargetMcpSnippetSchema = z.object({
  targetId: IdeIdSchema,
  scope: ScopeSchema.optional(),
});

export async function createVibeBasketMcpServer() {
  const services = new VibebasketMcpServices();
  const server = new McpServer(
    { name: "vibebasket-local", version: "0.1.0" },
    {
      instructions:
        "Use targets.list, targets.get_setup_guide, and targets.get_mcp_snippet to understand target capabilities and native config shapes. Use catalog.search before install planning. Prefer install.plan before install.apply. Cloud stack save is not linked yet in local MCP; use local stacks unless session state says otherwise.",
    },
  );

  server.registerTool(
    "session.get_state",
    {
      description: "Report the current VibeBasket MCP session capabilities and local state.",
      inputSchema: z.object({}),
    },
    async () => toolText(success(await services.getSessionState())),
  );

  server.registerTool(
    "targets.list",
    {
      description: "List the supported VibeBasket install targets and their capabilities.",
      inputSchema: z.object({}),
    },
    async () =>
      toolText(
        success(
          { targets: services.listTargets() },
          [],
          "Choose a targetId and call targets.get_setup_guide when you need the MCP integration details for one client.",
        ),
      ),
  );

  server.registerTool(
    "targets.get_setup_guide",
    {
      description:
        "Explain how to connect the local VibeBasket MCP server or install surface for a specific target and scope.",
      inputSchema: TargetSetupGuideSchema,
    },
    async ({ targetId, scope }) =>
      toolText(
        success(
          { guide: services.getTargetSetupGuide(targetId, scope) },
          [],
          "After the target is connected, call session.get_state and then use catalog.search or install.plan.",
        ),
      ),
  );

  server.registerTool(
    "targets.get_mcp_snippet",
    {
      description:
        "Return the native MCP config fragment for one target and scope so the client can wire VibeBasket MCP without guessing the config shape.",
      inputSchema: TargetMcpSnippetSchema,
    },
    async ({ targetId, scope }) =>
      toolText(
        success(
          { snippet: services.getTargetMcpSnippet(targetId, scope) },
          [],
          "Merge the returned fragment into the target's existing config, then restart that client and call session.get_state.",
        ),
      ),
  );

  server.registerTool(
    "catalog.search",
    {
      description: "Search the VibeBasket catalog for MCPs, skills, rules, and workflows.",
      inputSchema: SearchInputSchema,
    },
    async (args) => {
      const result = await services.catalog.search(args);
      return toolText(
        success(
          result,
          [],
          result.items.length > 0
            ? "Choose the item IDs you want, then call install.plan with targetIds and scope."
            : undefined,
        ),
      );
    },
  );

  server.registerTool(
    "catalog.get_item",
    {
      description: "Fetch one catalog item by ID.",
      inputSchema: GetItemInputSchema,
    },
    async ({ id }) => {
      const item = await services.catalog.getItem(id);
      if (!item) {
        return toolText(
          failure(
            "not_found",
            `Catalog item ${id} was not found.`,
            { id },
            "Search the catalog again to discover the current item IDs.",
          ),
        );
      }
      return toolText(success({ item }));
    },
  );

  server.registerTool(
    "catalog.refresh",
    {
      description: "Refresh the MCP session's cached view of the VibeBasket catalog with cooldown protection.",
      inputSchema: z.object({}),
    },
    async (_args, extra) => {
      const policy = await enforceToolPolicy("medium", extra, "refresh the local catalog cache");
      if (!policy.allowed) {
        return toolText(
          failure("policy_blocked", policy.reason ?? "Refresh blocked.", {}, policy.reason),
        );
      }

      try {
        const result = await services.catalog.refresh();
        if (!result.refreshed) {
          return toolText(
            failure(
              "cooldown_active",
              `Refresh cooldown active for ${result.cooldownMsRemaining}ms.`,
              result,
              "Wait for the cooldown to expire before requesting another refresh.",
            ),
          );
        }
        return toolText(success(result));
      } catch (error) {
        return toolText(
          failure(
            "network_unavailable",
            error instanceof Error ? error.message : String(error),
            {},
            "Check network access or the configured VibeBasket API base URL.",
          ),
        );
      }
    },
  );

  server.registerTool(
    "stack.list",
    {
      description: "List locally saved VibeBasket stacks available to this machine.",
      inputSchema: z.object({}),
    },
    async () => toolText(success({ stacks: await services.listLocalStacks() })),
  );

  server.registerTool(
    "stack.save_local",
    {
      description: "Save the current selection as a local reusable VibeBasket stack on this machine.",
      inputSchema: SaveLocalStackSchema,
    },
    async (args, extra) => {
      const policy = await enforceToolPolicy("medium", extra, "save a local VibeBasket stack");
      if (!policy.allowed) {
        return toolText(failure("policy_blocked", policy.reason ?? "Save blocked.", {}, policy.reason));
      }

      const stack = await services.saveLocalStack(args);
      return toolText(
        success(
          { stack },
          [],
          "You can call stack.load later with this stackId or continue to install.plan.",
        ),
      );
    },
  );

  server.registerTool(
    "stack.save_cloud",
    {
      description: "Attempt to save a stack to the authenticated VibeBasket profile. Phase 1 reports availability and guidance only.",
      inputSchema: SaveLocalStackSchema,
    },
    async () =>
      toolText(
        failure(
          "auth_required",
          "Cloud stack save is not linked in the local MCP yet.",
          { available: false },
          "Use stack.save_local inside the IDE today, or save profile-backed stacks on the VibeBasket website.",
        ),
      ),
  );

  server.registerTool(
    "stack.load",
    {
      description: "Load a locally saved VibeBasket stack by ID.",
      inputSchema: LocalStackLoadSchema,
    },
    async ({ stackId }) => {
      const stack = await services.loadLocalStack(stackId);
      if (!stack) {
        return toolText(
          failure("not_found", `Local stack ${stackId} was not found.`, { stackId }),
        );
      }
      return toolText(
        success(
          { stack },
          [],
          "Use this stack's itemIds and targetIds with install.plan or install.apply.",
        ),
      );
    },
  );

  server.registerTool(
    "install.plan",
    {
      description: "Dry-run a VibeBasket installation plan for selected catalog items and targets.",
      inputSchema: SelectionInputSchema,
    },
    async (args) => {
      try {
        const planned = await services.planInstall(args);
        return toolText(
          success(
            planned,
            planned.result.unsupportedFeatureMessages,
            "If the plan looks right, call install.apply with the same selection or the returned bundleUrl.",
          ),
        );
      } catch (error) {
        return toolText(
          failure(
            "planning_failed",
            error instanceof Error ? error.message : String(error),
            {},
            "Check the selected item IDs, targets, and network availability.",
          ),
        );
      }
    },
  );

  server.registerTool(
    "install.apply",
    {
      description: "Apply a VibeBasket bundle or selection to the supported local AI IDE targets.",
      inputSchema: InstallApplyInputSchema,
    },
    async (args, extra) => {
      const policy = await enforceToolPolicy("high", extra, "apply configuration changes to local AI IDEs");
      if (!policy.allowed) {
        return toolText(failure("policy_blocked", policy.reason ?? "Apply blocked.", {}, policy.reason));
      }

      try {
        const result = await services.applyInstall(args);
        if (result.failedTargets.length > 0) {
          return toolText(
            failure(
              "apply_failed",
              `Apply completed with failures: ${result.failedTargets.map((target) => target.targetId).join(", ")}`,
              result,
              "Review the failed target errors and use install.list_backups or install.rollback if needed.",
            ),
          );
        }

        return toolText(
          success(
            result,
            result.unsupportedFeatureMessages,
            "If a target needs to be reverted, inspect install.list_backups and then call install.rollback.",
          ),
        );
      } catch (error) {
        return toolText(
          failure(
            "apply_failed",
            error instanceof Error ? error.message : String(error),
            {},
            "Missing local secrets are the most common cause. Provide them in process.env, .vibebasket.env, or keychain and try again.",
          ),
        );
      }
    },
  );

  server.registerTool(
    "install.list_backups",
    {
      description: "List local VibeBasket-created configuration backups available for rollback.",
      inputSchema: z.object({}),
    },
    async () => toolText(success({ backups: await services.listBackups() })),
  );

  server.registerTool(
    "install.rollback",
    {
      description: "Restore a previously created VibeBasket backup by backup filename path metadata.",
      inputSchema: z.object({
        backupPath: z.string().trim().min(1),
      }),
    },
    async ({ backupPath }, extra) => {
      const policy = await enforceToolPolicy("high", extra, "restore a previous configuration backup");
      if (!policy.allowed) {
        return toolText(
          failure("policy_blocked", policy.reason ?? "Rollback blocked.", {}, policy.reason),
        );
      }

      try {
        const result = await restoreBackupByPath(backupPath);
        return toolText(
          success(
            result,
            [],
            "Use install.list_backups to inspect other recovery points if needed.",
          ),
        );
      } catch (error) {
        return toolText(
          failure(
            "rollback_failed",
            error instanceof Error ? error.message : String(error),
            {},
            "Check the backup path from install.list_backups and try again.",
          ),
        );
      }
    },
  );

  return server;
}

export async function serveVibeBasketMcp() {
  const server = await createVibeBasketMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
