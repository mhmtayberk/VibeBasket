import { runScheduledBackupJob } from "@/lib/admin-backup-ops";
import { applySecurityHeaders } from "@/lib/security-headers";
import { NextResponse } from "next/server";

function isAuthorized(request: Request) {
  const expectedToken = process.env.BACKUP_JOB_TOKEN?.trim();
  if (!expectedToken) {
    return false;
  }

  const headerToken = request.headers.get("x-vibebasket-backup-token")?.trim();
  const bearerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  return headerToken === expectedToken || bearerToken === expectedToken;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return applySecurityHeaders(
      NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "1";
    const result = await runScheduledBackupJob({ force });

    return applySecurityHeaders(
      NextResponse.json(result, {
        status: result.success ? 200 : 500,
      }),
    );
  } catch (error) {
    console.error("Scheduled backup job failed:", error);
    return applySecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Backup job failed",
        },
        { status: 500 },
      ),
    );
  }
}
