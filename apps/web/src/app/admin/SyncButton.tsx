"use client";

import { useState, useTransition } from "react";
import { triggerSyncAction } from "./actions";

export function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = () => {
    setResult(null);
    startTransition(async () => {
      const response = await triggerSyncAction();
      if (response.success && response.summary) {
        setResult({
          success: true,
          message: `Synced ${response.summary.totalItems} items (${response.summary.mcps} MCPs, ${response.summary.skills} Skills) in ${(response.summary.durationMs / 1000).toFixed(2)}s.`
        });
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to complete registry synchronization."
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSync}
        disabled={isPending}
        className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold tracking-wider uppercase border transition-all duration-300 flex items-center justify-center gap-2 ${
          isPending
            ? "bg-white/5 border-white/10 text-neutral-500 cursor-not-allowed"
            : "bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border-[#a855f7]/30 hover:border-[#a855f7]/50 text-white cursor-pointer active:scale-95"
        }`}
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
          className={`p-3 rounded-lg border text-[11px] font-mono leading-relaxed transition-all ${
            result.success
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/5 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex gap-1.5">
            <span className="font-bold">{result.success ? "[OK]" : "[ERR]"}</span>
            <span>{result.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
