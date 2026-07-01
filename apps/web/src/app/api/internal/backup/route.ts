import { timingSafeEqual } from "node:crypto";
import { runScheduledBackupJob } from "@/lib/admin-backup-ops";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";
import { createTooManyRequestsResponse } from "@/lib/security-headers";
import { NextResponse } from "next/server";

const BACKUP_JOB_RATE_LIMIT = 10;
const BACKUP_JOB_RATE_WINDOW_MS = 60 * 1000;

function constantTimeMatch(candidate: string | null | undefined, expected: string) {
  if (!candidate) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidate, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

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

  return (
    constantTimeMatch(headerToken, expectedToken) || constantTimeMatch(bearerToken, expectedToken)
  );
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    `internal-backup:${getClientAddress(request)}`,
    BACKUP_JOB_RATE_LIMIT,
    BACKUP_JOB_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return createTooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }

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
