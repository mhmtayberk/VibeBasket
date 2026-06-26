import {
  runGetStorageConfig,
  runRemoveStorageConfig,
  runSaveSchedule,
  runSaveStorageConfig,
} from "@/lib/admin-backup-ops";
import {
  createAdminForbiddenResponse,
  requireAdminMutation,
  requireAdminRole,
} from "@/lib/admin-session";
import { applySecurityHeaders } from "@/lib/security-headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdminRole();
    const result = await runGetStorageConfig();
    return applySecurityHeaders(NextResponse.json(result, { status: result.success ? 200 : 500 }));
  } catch (error) {
    return (
      createAdminForbiddenResponse(error) ??
      applySecurityHeaders(
        NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }),
      )
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      backend?: string;
      credentials?: Record<string, string>;
    } | null;
    const backend = body?.backend?.trim();

    if (!backend) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Missing backend." }, { status: 400 }),
      );
    }

    await requireAdminMutation(request);
    const result = await runSaveStorageConfig(backend, body?.credentials ?? {});
    return applySecurityHeaders(NextResponse.json(result, { status: result.success ? 200 : 500 }));
  } catch (error) {
    return (
      createAdminForbiddenResponse(error) ??
      applySecurityHeaders(
        NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }),
      )
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      enabled?: boolean;
      intervalHours?: number;
    } | null;

    if (typeof body?.enabled !== "boolean" || typeof body?.intervalHours !== "number") {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Missing schedule configuration." },
          { status: 400 },
        ),
      );
    }

    await requireAdminMutation(request);
    const result = await runSaveSchedule(body.enabled, body.intervalHours);
    return applySecurityHeaders(NextResponse.json(result, { status: result.success ? 200 : 500 }));
  } catch (error) {
    return (
      createAdminForbiddenResponse(error) ??
      applySecurityHeaders(
        NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }),
      )
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminMutation(request);
    const result = await runRemoveStorageConfig();
    return applySecurityHeaders(NextResponse.json(result, { status: result.success ? 200 : 500 }));
  } catch (error) {
    return (
      createAdminForbiddenResponse(error) ??
      applySecurityHeaders(
        NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }),
      )
    );
  }
}
