import { runRestoreBackup } from "@/lib/admin-backup-ops";
import { requireAdminRole } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { key?: string } | null;
  const key = body?.key?.trim();

  if (!key) {
    return NextResponse.json({ success: false, error: "Missing backup key." }, { status: 400 });
  }

  await requireAdminRole();
  const result = await runRestoreBackup(key);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
