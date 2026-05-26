import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupportedTargetId } from "./targets";

const MAX_STACK_ITEMS = 100;
const MAX_STACK_TARGETS = 20;

export const createStackSchema = z.object({
	name: z.string().trim().min(1).max(80),
	description: z
		.string()
		.trim()
		.max(280)
		.optional()
		.transform((value) => value || undefined),
	itemIds: z.array(z.string().trim().min(1)).min(1).max(MAX_STACK_ITEMS),
	targetIds: z.array(z.string().trim().min(1)).min(1).max(MAX_STACK_TARGETS),
});

export const updateStackSchema = z
	.object({
		name: z.string().trim().min(1).max(80).optional(),
		description: z
			.string()
			.trim()
			.max(280)
			.optional()
			.transform((value) => value || undefined),
	})
	.refine(
		(value) => value.name !== undefined || value.description !== undefined,
		{
			message: "Provide at least one field to update.",
		},
	);

export type CreateStackInput = z.infer<typeof createStackSchema>;
export type UpdateStackInput = z.infer<typeof updateStackSchema>;

export function normalizeStackTargetIds(targetIds: string[]) {
	const uniqueTargetIds = Array.from(new Set(targetIds));
	const unsupportedTargetIds = uniqueTargetIds.filter(
		(targetId) => !isSupportedTargetId(targetId),
	);

	if (unsupportedTargetIds.length > 0) {
		throw new Error(
			`Unsupported target IDs: ${unsupportedTargetIds.join(", ")}`,
		);
	}

	return uniqueTargetIds;
}

export function normalizeStackItemIds(itemIds: string[]) {
	return Array.from(new Set(itemIds));
}

export function unauthorizedResponse() {
	return NextResponse.json(
		{ error: "Authentication required." },
		{ status: 401 },
	);
}
