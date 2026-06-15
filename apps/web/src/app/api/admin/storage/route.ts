import {
  runGetStorageConfig,
  runRemoveStorageConfig,
  runSaveSchedule,
  runSaveStorageConfig,
} from "@/lib/admin-backup-ops";
import { requireAdminRole } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdminRole();
  const result = await runGetStorageConfig();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    backend?: string;
    credentials?: Record<string, string>;
  } | null;
  const backend = body?.backend?.trim();

  if (!backend) {
    return NextResponse.json({ success: false, error: "Missing backend." }, { status: 400 });
  }

  await requireAdminRole();
  const result = await runSaveStorageConfig(backend, body?.credentials ?? {});
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    enabled?: boolean;
    intervalHours?: number;
  } | null;

  if (typeof body?.enabled !== "boolean" || typeof body?.intervalHours !== "number") {
    return NextResponse.json(
      { success: false, error: "Missing schedule configuration." },
      { status: 400 },
    );
  }

  await requireAdminRole();
  const result = await runSaveSchedule(body.enabled, body.intervalHours);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function DELETE() {
  await requireAdminRole();
  const result = await runRemoveStorageConfig();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
