import { runRestoreBackup } from "@/lib/admin-backup-ops";
import { createAdminForbiddenResponse, requireAdminMutation } from "@/lib/admin-session";
import { applySecurityHeaders } from "@/lib/security-headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { key?: string } | null;
    const key = body?.key?.trim();

    if (!key) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Missing backup key." }, { status: 400 }),
      );
    }

    await requireAdminMutation(request);
    const result = await runRestoreBackup(key);
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
