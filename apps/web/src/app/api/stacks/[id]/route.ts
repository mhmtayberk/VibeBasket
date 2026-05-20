import { and, asc, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  db,
  savedStackItems,
  savedStackTargets,
  savedStacks,
} from "@vibebasket/core";
import { requireCurrentUserId, SessionRequiredError } from "@/lib/session";
import { updateStackSchema } from "../../../../lib/stacks";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/stacks/[id]">
) {
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
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }

    console.error("Failed to fetch saved stack:", error);
    return NextResponse.json({ error: "Failed to fetch saved stack." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/stacks/[id]">
) {
  try {
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
        return NextResponse.json({ error: "You already have a stack with this name." }, { status: 409 });
      }
    }

    const updatedAt = new Date();
    await db
      .update(savedStacks)
      .set({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        updatedAt,
      })
      .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)));

    const updatedStack = await db
      .select({
        id: savedStacks.id,
        name: savedStacks.name,
        description: savedStacks.description,
        createdAt: savedStacks.createdAt,
        updatedAt: savedStacks.updatedAt,
      })
      .from(savedStacks)
      .where(and(eq(savedStacks.id, id), eq(savedStacks.userId, userId)))
      .orderBy(desc(savedStacks.updatedAt))
      .limit(1);

    return NextResponse.json(updatedStack[0]);
  } catch (error) {
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid stack payload." }, { status: 400 });
    }

    console.error("Failed to update saved stack:", error);
    return NextResponse.json({ error: "Failed to update saved stack." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/stacks/[id]">
) {
  try {
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
    if (error instanceof SessionRequiredError) {
      return unauthorizedResponse();
    }

    console.error("Failed to delete saved stack:", error);
    return NextResponse.json({ error: "Failed to delete saved stack." }, { status: 500 });
  }
}
