import { runBackupDatabase, runDeleteBackup, runListBackups } from "@/lib/admin-backup-ops";
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
    const result = await runListBackups();
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
    await requireAdminMutation(request);
    const result = await runBackupDatabase();
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
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Missing backup key." }, { status: 400 }),
      );
    }

    await requireAdminMutation(request);
    const result = await runDeleteBackup(key);
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
