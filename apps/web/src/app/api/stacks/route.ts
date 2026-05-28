import {
	catalogItems,
	db,
	savedStackItems,
	savedStacks,
	savedStackTargets,
} from "@vibebasket/core";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
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
import {
	applySecurityHeaders,
	createTooManyRequestsResponse,
} from "@/lib/security-headers";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";

const STACKS_RATE_LIMIT = 30;
const STACKS_RATE_WINDOW_MS = 60 * 1000;
const DEFAULT_STACKS_LIMIT = 20;
const MAX_STACKS_LIMIT = 50;
export async function GET(
	request: NextRequest,
	_context: RouteContext<"/api/stacks">,
) {
	const rateLimit = checkRateLimit(
		`stacks:${getClientAddress(request)}`,
		STACKS_RATE_LIMIT,
		STACKS_RATE_WINDOW_MS,
	);
	if (!rateLimit.allowed) {
		return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
	}
	try {
		const userId = await requireCurrentUserId();
		const { searchParams } = new URL(request.url);
		const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
		const rawLimit = parseInt(searchParams.get("limit") || `${DEFAULT_STACKS_LIMIT}`, 10) || DEFAULT_STACKS_LIMIT;
		const limit = Math.min(MAX_STACKS_LIMIT, Math.max(1, rawLimit));
		const offset = (page - 1) * limit;

		const [stacks, totalResult] = await Promise.all([
			db
				.select({
					id: savedStacks.id,
					name: savedStacks.name,
					description: savedStacks.description,
					createdAt: savedStacks.createdAt,
					updatedAt: savedStacks.updatedAt,
				})
				.from(savedStacks)
				.where(eq(savedStacks.userId, userId))
				.orderBy(desc(savedStacks.updatedAt), asc(savedStacks.name))
				.limit(limit)
				.offset(offset),
			db
				.select({ total: sql<number>`count(*)` })
				.from(savedStacks)
				.where(eq(savedStacks.userId, userId)),
		]);

		const total = Number(totalResult[0]?.total ?? 0);
		const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

		const stackIds = stacks.map((stack) => stack.id);
		const [stackItems, stackTargets] = stackIds.length
			? await Promise.all([
					db
						.select({ stackId: savedStackItems.stackId })
						.from(savedStackItems)
						.where(inArray(savedStackItems.stackId, stackIds)),
					db
						.select({ stackId: savedStackTargets.stackId, targetId: savedStackTargets.targetId })
						.from(savedStackTargets)
						.where(inArray(savedStackTargets.stackId, stackIds)),
				])
			: [[], []];

		const itemCounts = new Map<string, number>();
		for (const item of stackItems) {
			itemCounts.set(item.stackId, (itemCounts.get(item.stackId) ?? 0) + 1);
		}
		const targetMap = new Map<string, string[]>();
		for (const t of stackTargets) {
			const arr = targetMap.get(t.stackId) ?? [];
			arr.push(t.targetId);
			targetMap.set(t.stackId, arr);
		}

		return NextResponse.json({
			stacks: stacks.map((stack) => ({
				...stack,
				itemCount: itemCounts.get(stack.id) ?? 0,
				targetIds: targetMap.get(stack.id) ?? [],
			})),
			pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
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
	const rateLimit = checkRateLimit(
		`stacks:${getClientAddress(request)}`,
		STACKS_RATE_LIMIT,
		STACKS_RATE_WINDOW_MS,
	);
	if (!rateLimit.allowed) {
		return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
	}
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
