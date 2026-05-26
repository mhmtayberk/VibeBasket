"use server";

import { revalidatePath } from "next/cache";
import { RegistrySyncService } from "@vibebasket/registry";
import { requireAdminRole } from "@/lib/admin-session";

/**
 * Highly secure Next.js Server Action to manually trigger catalog sync.
 * Restricts invocation strictly to verified admin sessions on the server side.
 */
export async function triggerSyncAction() {
  // Enforce server-side authorization check
  await requireAdminRole();

  try {
    const syncService = new RegistrySyncService();
    const started = Date.now();
    const summary = await syncService.syncAll();
    const durationMs = Date.now() - started;
    
    // Refresh admin stats dashboard after sync completes successfully
    revalidatePath("/admin");
    
    return {
      success: true,
      summary: {
        totalItems: summary.totalItems,
        mcps: summary.mcps.added,
        skills: summary.skills.added,
        durationMs,
        sourceErrorsCount: summary.sourceErrors.length
      }
    };
  } catch (error: any) {
    console.error("Failed to run manual admin sync:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during synchronization"
    };
  }
}
