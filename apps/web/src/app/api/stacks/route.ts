import {
	catalogItems,
	db,
	savedStackItems,
	savedStacks,
	savedStackTargets,
} from "@vibebasket/core";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireCurrentUserId, SessionRequiredError } from "@/lib/session";
import {
	createStackSchema,
	normalizeStackItemIds,
	normalizeStackTargetIds,
	unauthorizedResponse,
} from "../../../lib/stacks";

export async function GET(
	_request: NextRequest,
	_context: RouteContext<"/api/stacks">,
) {
	try {
		const userId = await requireCurrentUserId();
		const stacks = await db
			.select({
				id: savedStacks.id,
				name: savedStacks.name,
				description: savedStacks.description,
				createdAt: savedStacks.createdAt,
				updatedAt: savedStacks.updatedAt,
			})
			.from(savedStacks)
			.where(eq(savedStacks.userId, userId))
			.orderBy(desc(savedStacks.updatedAt), asc(savedStacks.name));

		const stackIds = stacks.map((stack) => stack.id);
		const [stackItems, stackTargets] = stackIds.length
			? await Promise.all([
					db
						.select({
							stackId: savedStackItems.stackId,
							catalogItemId: savedStackItems.catalogItemId,
							snapshotDisplayName: savedStackItems.snapshotDisplayName,
							catalogItemType: savedStackItems.catalogItemType,
							position: savedStackItems.position,
						})
						.from(savedStackItems)
						.where(inArray(savedStackItems.stackId, stackIds))
						.orderBy(asc(savedStackItems.position)),
					db
						.select({
							stackId: savedStackTargets.stackId,
							targetId: savedStackTargets.targetId,
							position: savedStackTargets.position,
						})
						.from(savedStackTargets)
						.where(inArray(savedStackTargets.stackId, stackIds))
						.orderBy(asc(savedStackTargets.position)),
				])
			: [[], []];

		const itemsByStackId = new Map<string, typeof stackItems>();
		for (const item of stackItems) {
			const items = itemsByStackId.get(item.stackId) ?? [];
			items.push(item);
			itemsByStackId.set(item.stackId, items);
		}

		const targetsByStackId = new Map<string, typeof stackTargets>();
		for (const target of stackTargets) {
			const targets = targetsByStackId.get(target.stackId) ?? [];
			targets.push(target);
			targetsByStackId.set(target.stackId, targets);
		}

		return NextResponse.json({
			stacks: stacks.map((stack) => ({
				...stack,
				itemCount: itemsByStackId.get(stack.id)?.length ?? 0,
				items: itemsByStackId.get(stack.id) ?? [],
				targetIds: (targetsByStackId.get(stack.id) ?? []).map(
					(target) => target.targetId,
				),
			})),
		});
	} catch (error) {
		if (error instanceof SessionRequiredError) {
			return unauthorizedResponse();
		}

		console.error("Failed to list saved stacks:", error);
		return NextResponse.json(
			{ error: "Failed to list saved stacks." },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	_context: RouteContext<"/api/stacks">,
) {
	try {
		const userId = await requireCurrentUserId();
		const body = await request.json();
		const payload = createStackSchema.parse(body);
		const itemIds = normalizeStackItemIds(payload.itemIds);
		const targetIds = normalizeStackTargetIds(payload.targetIds);

		const existingStack = await db
			.select({ id: savedStacks.id })
			.from(savedStacks)
			.where(
				and(eq(savedStacks.userId, userId), eq(savedStacks.name, payload.name)),
			)
			.limit(1);

		if (existingStack[0]) {
			return NextResponse.json(
				{ error: "You already have a stack with this name." },
				{ status: 409 },
			);
		}

		const catalogSelection = await db
			.select({
				id: catalogItems.id,
				type: catalogItems.type,
				displayName: catalogItems.displayName,
				description: catalogItems.description,
			})
			.from(catalogItems)
			.where(inArray(catalogItems.id, itemIds));

		const selectedIds = new Set(catalogSelection.map((item) => item.id));
		const missingItemIds = itemIds.filter((itemId) => !selectedIds.has(itemId));

		if (missingItemIds.length > 0) {
			return NextResponse.json(
				{ error: `Catalog items not found: ${missingItemIds.join(", ")}` },
				{ status: 400 },
			);
		}

		const stackId = nanoid(12);
		const now = new Date();
		const catalogSelectionById = new Map(
			catalogSelection.map((item) => [item.id, item] as const),
		);

		await db.transaction(async (tx) => {
			await tx.insert(savedStacks).values({
				id: stackId,
				userId,
				name: payload.name,
				description: payload.description,
				createdAt: now,
				updatedAt: now,
			});

			await tx.insert(savedStackItems).values(
				itemIds.map((itemId, index) => {
					const item = catalogSelectionById.get(itemId);
					if (!item) {
						throw new Error(
							`Catalog item missing during stack persistence: ${itemId}`,
						);
					}
					return {
						id: nanoid(14),
						stackId,
						catalogItemId: item.id,
						catalogItemType: item.type,
						snapshotDisplayName: item.displayName,
						snapshotDescription: item.description,
						position: index,
						createdAt: now,
					};
				}),
			);

			await tx.insert(savedStackTargets).values(
				targetIds.map((targetId, index) => ({
					id: nanoid(14),
					stackId,
					targetId,
					position: index,
				})),
			);
		});

		return NextResponse.json(
			{
				id: stackId,
				name: payload.name,
				description: payload.description,
				itemCount: itemIds.length,
				targetIds,
				createdAt: now,
				updatedAt: now,
			},
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof SessionRequiredError) {
			return unauthorizedResponse();
		}
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: error.issues[0]?.message ?? "Invalid stack payload." },
				{ status: 400 },
			);
		}
		if (
			error instanceof Error &&
			error.message.startsWith("Unsupported target IDs:")
		) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		console.error("Failed to create saved stack:", error);
		return NextResponse.json(
			{ error: "Failed to create saved stack." },
			{ status: 500 },
		);
	}
}
