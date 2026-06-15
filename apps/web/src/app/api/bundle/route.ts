import { auth } from "@/auth";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders, createTooManyRequestsResponse } from "@/lib/security-headers";
import { isSupportedTargetId } from "@/lib/targets";
import {
  type Bundle,
  BundleSchema,
  McpEntrySchema,
  RuleEntrySchema,
  SCHEMA_VERSION,
  ScopeSchema,
  SkillEntrySchema,
  WorkflowPackEntrySchema,
  bundles,
  catalogItems,
  db,
} from "@vibebasket/core";
import { inArray, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_BUNDLE_BYTES = 100 * 1024;
const BUNDLE_RATE_LIMIT = 20;
const BUNDLE_RATE_WINDOW_MS = 60 * 1000;

const createBundleRequestSchema = z.object({
  targets: z.array(z.string()).min(1),
  scope: ScopeSchema,
  itemIds: z.array(z.string()).min(1),
});

type CatalogBundleRow = Pick<typeof catalogItems.$inferSelect, "id" | "type" | "data">;

function createBundleTooLargeResponse() {
  return applySecurityHeaders(
    NextResponse.json({ error: "Bundle too large (max 100KB)" }, { status: 413 }),
  );
}

function getErrorMessage(error: unknown) {
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message;
  }
  return "Internal Server Error";
}

function partitionBundleItems(
  selectedItems: CatalogBundleRow[],
): Omit<Bundle, "schemaVersion" | "scope" | "targets"> {
  const mcps: Bundle["mcps"] = [];
  const skills: Bundle["skills"] = [];
  const rules: Bundle["rules"] = [];
  const workflowPacks: Bundle["workflowPacks"] = [];

  for (const item of selectedItems) {
    switch (item.type) {
      case "mcp":
        mcps.push(McpEntrySchema.parse(item.data));
        break;
      case "skill":
        skills.push(SkillEntrySchema.parse(item.data));
        break;
      case "rule":
        rules.push(RuleEntrySchema.parse(item.data));
        break;
      case "workflow":
        workflowPacks.push(WorkflowPackEntrySchema.parse(item.data));
        break;
      default:
        break;
    }
  }

  return { mcps, skills, rules, workflowPacks };
}

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(
      `bundle:${getClientAddress(req)}`,
      BUNDLE_RATE_LIMIT,
      BUNDLE_RATE_WINDOW_MS,
    );
    if (!rateLimit.allowed) {
      return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BUNDLE_BYTES) {
      return createBundleTooLargeResponse();
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BUNDLE_BYTES) {
      return createBundleTooLargeResponse();
    }

    const body = JSON.parse(rawBody);
    const parsed = createBundleRequestSchema.safeParse(body);

    if (!parsed.success) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 }),
      );
    }

    const { targets, scope, itemIds } = parsed.data;
    const unsupportedTargets = targets.filter((target) => !isSupportedTargetId(target));
    if (unsupportedTargets.length > 0) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            error: `Unsupported bundle targets: ${unsupportedTargets.join(", ")}`,
          },
          { status: 400 },
        ),
      );
    }

    // Fetch items from DB
    const selectedItems = await db
      .select()
      .from(catalogItems)
      .where(inArray(catalogItems.id, itemIds));
    const selectedItemIds = new Set(selectedItems.map((item) => item.id));
    const missingItemIds = itemIds.filter((itemId: string) => !selectedItemIds.has(itemId));

    if (missingItemIds.length > 0) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: `Catalog items not found: ${missingItemIds.join(", ")}` },
          { status: 400 },
        ),
      );
    }

    const { mcps, skills, rules, workflowPacks } = partitionBundleItems(selectedItems);
    const manifest: Bundle = {
      schemaVersion: SCHEMA_VERSION,
      scope,
      targets: targets as Bundle["targets"],
      mcps,
      skills,
      rules,
      workflowPacks,
    };

    const validated = BundleSchema.parse(manifest);

    const id = nanoid(10);

    const session = await auth().catch(() => null);
    const isRegistered = Boolean(session?.user?.id);
    // Anonymous: 48h TTL, auto-cleaned. Registered: 365d, kept.
    const TTL_MS = isRegistered ? 365 * 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + TTL_MS);

    await db.insert(bundles).values({
      id,
      manifest: validated,
      userId: session?.user?.id ?? null,
      expiresAt,
    });

    const origin = process.env.NEXTAUTH_URL?.trim() || new URL(req.url).origin;
    return applySecurityHeaders(NextResponse.json({ id, url: `${origin}/api/bundle/${id}` }));
  } catch (error) {
    console.error("Failed to create bundle:", error);
    return applySecurityHeaders(
      NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }),
    );
  }
}
