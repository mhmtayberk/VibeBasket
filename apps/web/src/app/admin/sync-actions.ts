"use server";

import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { requireAdminRole } = await import("@/lib/admin-session");
  return requireAdminRole();
}

export async function triggerSyncAction() {
  await requireAdmin();

  try {
    const { RegistrySyncService } = await import("@vibebasket/registry");
    const syncService = new RegistrySyncService();
    const started = Date.now();
    const summary = await syncService.syncAll();
    const durationMs = Date.now() - started;

    revalidatePath("/admin");

    return {
      success: true,
      summary: {
        totalItems: summary.totalItems ?? 0,
        mcps: summary.mcps?.added ?? 0,
        skills: summary.skills?.added ?? 0,
        durationMs,
        sourceErrorsCount: summary.sourceErrors?.length ?? 0,
      },
    };
  } catch (error: unknown) {
    console.error("Failed to run manual admin sync:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "An unexpected error occurred during synchronization";
    return {
      success: false,
      error: message,
    };
  }
}
