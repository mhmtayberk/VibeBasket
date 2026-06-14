"use client";

import { useState, useTransition } from "react";
import { triggerSyncAction } from "./sync-actions";

export function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = () => {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await triggerSyncAction();
        if (response.success && response.summary) {
          setResult({
            success: true,
            message: `Synced ${response.summary.totalItems} items (${response.summary.mcps} MCPs, ${response.summary.skills} Skills) in ${(response.summary.durationMs / 1000).toFixed(2)}s.`,
          });
        } else {
          setResult({
            success: false,
            message: response.error || "Failed to complete registry synchronization.",
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error — the sync service may be unavailable.";
        setResult({ success: false, message });
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 border font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
          isPending
            ? "border-border/50 bg-background/30 text-muted-foreground cursor-not-allowed"
            : "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
        }`}
      >
        {isPending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Syncing Registry...
          </>
        ) : (
          "Trigger Manual Sync"
        )}
      </button>

      {result && (
        <div
          className={`border p-3 font-mono text-[11px] leading-relaxed ${
            result.success
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span className="font-bold">{result.success ? "[OK]" : "[ERR]"}</span> {result.message}
        </div>
      )}
    </div>
  );
}
