import { runBackupDatabase, runDeleteBackup, runListBackups } from "@/lib/admin-backup-ops";
import { requireAdminRole } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdminRole();
  const result = await runListBackups();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST() {
  await requireAdminRole();
  const result = await runBackupDatabase();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ success: false, error: "Missing backup key." }, { status: 400 });
  }

  await requireAdminRole();
  const result = await runDeleteBackup(key);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
