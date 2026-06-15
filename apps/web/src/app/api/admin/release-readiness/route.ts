import { runGetReleaseReadiness } from "@/lib/admin-backup-ops";
import { requireAdminRole } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdminRole();
  const result = await runGetReleaseReadiness();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
