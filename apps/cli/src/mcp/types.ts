import { z } from "zod";
import { IdeIdSchema, ScopeSchema } from "../../../../packages/core/src/manifest.js";

export const WritePolicyModeSchema = z.enum(["confirm", "allow", "deny"]);
export type WritePolicyMode = z.infer<typeof WritePolicyModeSchema>;

export type McpToolEnvelope<T extends Record<string, unknown> = Record<string, unknown>> = {
  ok: boolean;
  data: T;
  warnings: string[];
  nextStepHint?: string;
  errorCode?: string;
};

export const SelectionInputSchema = z.object({
  itemIds: z.array(z.string().trim().min(1)).min(1).max(100),
  targetIds: z.array(IdeIdSchema).min(1).max(20),
  scope: ScopeSchema.default("user"),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(280).optional(),
});

export type SelectionInput = z.infer<typeof SelectionInputSchema>;
