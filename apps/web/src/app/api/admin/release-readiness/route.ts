import { runGetReleaseReadiness } from "@/lib/admin-backup-ops";
import { createAdminForbiddenResponse, requireAdminRole } from "@/lib/admin-session";
import { applySecurityHeaders } from "@/lib/security-headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdminRole();
    const result = await runGetReleaseReadiness();
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
