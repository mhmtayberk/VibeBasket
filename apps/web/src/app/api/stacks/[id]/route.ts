import { InvalidOriginError, assertTrustedMutationOrigin } from "@/lib/csrf";
import { SessionRequiredError, requireCurrentUserId } from "@/lib/session";
import {
  catalogItems,
  db,
  savedStackItems,
  savedStackTargets,
  savedStacks,
} from "@vibebasket/core";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  normalizeStackItemIds,
  normalizeStackTargetIds,
  unauthorizedResponse,
  updateStackSchema,
} from "../../../../lib/stacks";

import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";

const STACK_ID_RATE_LIMIT = 30;
const STACK_ID_RATE_WINDOW_MS = 60 * 1000;
type StackRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: StackRouteContext) {
  const rateLimit = checkRateLimit(
    `stacks-id:${getClientAddress(request)}`,
    STACK_ID_RATE_LIMIT,
    STACK_ID_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }
  try {
    const userId = await requireCurrentUserId();
    const { id } = await context.params;

    const stack = await db
      .select({
        id: savedStacks.id,
        name: savedStacks.name,
        description: savedStacks.description,
        createdAt: savedStacks.createdAt,
        updatedAt: savedStacks.updatedAt,
      })
      .from(savedStacks)
      .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)))
      .limit(1);

    if (!stack[0]) {
      return NextResponse.json({ error: "Saved stack not found." }, { status: 404 });
    }

    const [items, targets] = await Promise.all([
      db
        .select({
          id: savedStackItems.id,
          catalogItemId: savedStackItems.catalogItemId,
          catalogItemType: savedStackItems.catalogItemType,
          snapshotDisplayName: savedStackItems.snapshotDisplayName,
          snapshotDescription: savedStackItems.snapshotDescription,
          position: savedStackItems.position,
          createdAt: savedStackItems.createdAt,
        })
        .from(savedStackItems)
        .where(eq(savedStackItems.stackId, id))
        .orderBy(asc(savedStackItems.position)),
      db
        .select({
          id: savedStackTargets.id,
          targetId: savedStackTargets.targetId,
          position: savedStackTargets.position,
        })
        .from(savedStackTargets)
        .where(eq(savedStackTargets.stackId, id))
        .orderBy(asc(savedStackTargets.position)),
    ]);

    return NextResponse.json({
      ...stack[0],
      items,
      targetIds: targets.map((target) => target.targetId),
    });
  } catch (error) {
    if (error instanceof InvalidOriginError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }

    console.error("Failed to fetch saved stack:", error);
    return NextResponse.json({ error: "Failed to fetch saved stack." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: StackRouteContext) {
  const rateLimit = checkRateLimit(
    `stacks-id:${getClientAddress(request)}`,
    STACK_ID_RATE_LIMIT,
    STACK_ID_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }
  try {
    assertTrustedMutationOrigin(request);
    const userId = await requireCurrentUserId();
    const { id } = await context.params;
    const body = await request.json();
    const payload = updateStackSchema.parse(body);

    const existingStack = await db
      .select({
        id: savedStacks.id,
        name: savedStacks.name,
      })
      .from(savedStacks)
      .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)))
      .limit(1);

    if (!existingStack[0]) {
      return NextResponse.json({ error: "Saved stack not found." }, { status: 404 });
    }

    if (payload.name && payload.name !== existingStack[0].name) {
      const conflictingStack = await db
        .select({ id: savedStacks.id })
        .from(savedStacks)
        .where(and(eq(savedStacks.userId, userId), eq(savedStacks.name, payload.name)))
        .limit(1);

      if (conflictingStack[0]) {
        return NextResponse.json(
          { error: "You already have a stack with this name." },
          { status: 409 },
        );
      }
    }

    const updatedAt = new Date();
    let itemIds: string[] | undefined;
    let targetIds: string[] | undefined;
    let catalogSelection: Array<{
      id: string;
      type: string;
      displayName: string;
      description: string | null;
    }> = [];

    if (payload.itemIds) {
      itemIds = normalizeStackItemIds(payload.itemIds);
      catalogSelection = await db
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
    }

    if (payload.targetIds) {
      targetIds = normalizeStackTargetIds(payload.targetIds);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(savedStacks)
        .set({
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined ? { description: payload.description } : {}),
          updatedAt,
        })
        .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)));

      if (itemIds) {
        await tx.delete(savedStackItems).where(eq(savedStackItems.stackId, id));
        const catalogSelectionById = new Map(
          catalogSelection.map((item) => [item.id, item] as const),
        );

        await tx.insert(savedStackItems).values(
          itemIds.map((itemId, index) => {
            const item = catalogSelectionById.get(itemId);
            if (!item) {
              throw new Error(`Catalog item missing during stack persistence: ${itemId}`);
            }
            return {
              id: nanoid(14),
              stackId: id,
              catalogItemId: item.id,
              catalogItemType: item.type,
              snapshotDisplayName: item.displayName,
              snapshotDescription: item.description,
              position: index,
              createdAt: updatedAt,
            };
          }),
        );
      }

      if (targetIds) {
        await tx.delete(savedStackTargets).where(eq(savedStackTargets.stackId, id));
        await tx.insert(savedStackTargets).values(
          targetIds.map((targetId, index) => ({
            id: nanoid(14),
            stackId: id,
            targetId,
            position: index,
          })),
        );
      }
    });

    const [updatedStack, updatedItems, updatedTargets] = await Promise.all([
      db
        .select({
          id: savedStacks.id,
          name: savedStacks.name,
          description: savedStacks.description,
          createdAt: savedStacks.createdAt,
          updatedAt: savedStacks.updatedAt,
        })
        .from(savedStacks)
        .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)))
        .limit(1),
      db
        .select({
          id: savedStackItems.id,
          catalogItemId: savedStackItems.catalogItemId,
          catalogItemType: savedStackItems.catalogItemType,
          snapshotDisplayName: savedStackItems.snapshotDisplayName,
          snapshotDescription: savedStackItems.snapshotDescription,
          position: savedStackItems.position,
          createdAt: savedStackItems.createdAt,
        })
        .from(savedStackItems)
        .where(eq(savedStackItems.stackId, id))
        .orderBy(asc(savedStackItems.position)),
      db
        .select({
          targetId: savedStackTargets.targetId,
        })
        .from(savedStackTargets)
        .where(eq(savedStackTargets.stackId, id))
        .orderBy(asc(savedStackTargets.position)),
    ]);

    return NextResponse.json({
      ...updatedStack[0],
      itemCount: updatedItems.length,
      items: updatedItems,
      targetIds: updatedTargets.map((t) => t.targetId),
    });
  } catch (error) {
    if (error instanceof InvalidOriginError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid stack payload." },
        { status: 400 },
      );
    }

    console.error("Failed to update saved stack:", error);
    return NextResponse.json({ error: "Failed to update saved stack." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: StackRouteContext) {
  const rateLimit = checkRateLimit(
    `stacks-id:${getClientAddress(request)}`,
    STACK_ID_RATE_LIMIT,
    STACK_ID_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }
  try {
    assertTrustedMutationOrigin(request);
    const userId = await requireCurrentUserId();
    const { id } = await context.params;

    const existingStack = await db
      .select({ id: savedStacks.id })
      .from(savedStacks)
      .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)))
      .limit(1);

    if (!existingStack[0]) {
      return NextResponse.json({ error: "Saved stack not found." }, { status: 404 });
    }

    await db.delete(savedStacks).where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidOriginError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }

    console.error("Failed to delete saved stack:", error);
    return NextResponse.json({ error: "Failed to delete saved stack." }, { status: 500 });
  }
}
