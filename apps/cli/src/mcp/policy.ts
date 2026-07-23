import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { WritePolicyMode } from "./types.js";

export type ToolRiskLevel = "low" | "medium" | "high";

const ConfirmationResponseSchema = z.object({
  approved: z.boolean(),
});

export function getWritePolicyMode(): WritePolicyMode {
  const mode = process.env.VIBEBASKET_MCP_WRITE_POLICY?.trim().toLowerCase();
  if (mode === "allow" || mode === "deny" || mode === "confirm") {
    return mode;
  }
  return "confirm";
}

export async function enforceToolPolicy(
  risk: ToolRiskLevel,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  actionLabel: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const mode = getWritePolicyMode();
  if (risk === "low") {
    return { allowed: true };
  }

  if (mode === "deny") {
    return { allowed: false, reason: "Write policy is set to deny." };
  }

  if (mode === "allow") {
    return { allowed: true };
  }

  try {
    const result = await extra.sendRequest({
      method: "elicitation/create",
      params: {
        message: `Approve VibeBasket action: ${actionLabel}`,
        requestedSchema: {
          type: "object",
          properties: {
            approved: {
              type: "boolean",
              title: "Approve",
              description: `Allow VibeBasket MCP to ${actionLabel}.`,
            },
          },
          required: ["approved"],
        },
      },
    });
    const parsed = ConfirmationResponseSchema.safeParse(
      result && typeof result === "object" && "content" in result ? (result as { content?: unknown }).content : result,
    );
    if (parsed.success && parsed.data.approved) {
      return { allowed: true };
    }
  } catch {
    return {
      allowed: false,
      reason:
        "Client confirmation is unavailable. Set VIBEBASKET_MCP_WRITE_POLICY=allow after reviewing the requested action if you want write tools enabled.",
    };
  }

  return { allowed: false, reason: "User declined the action." };
}
