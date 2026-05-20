"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBasketStore, type BasketItem } from "@/store/basketStore";
import { TARGET_OPTIONS } from "@/lib/targets";
import { cn } from "@/lib/utils";

type SavedStackSummary = {
  id: string;
  name: string;
  description?: string | null;
  itemCount: number;
  targetIds: string[];
  items: Array<{
    catalogItemId: string;
    snapshotDisplayName: string;
    catalogItemType: BasketItem["type"];
  }>;
};

type SavedStacksPanelProps = {
  enabled: boolean;
  className?: string;
  refreshToken?: number;
};

export function SavedStacksPanel({ enabled, className, refreshToken = 0 }: SavedStacksPanelProps) {
  const loadStack = useBasketStore((state) => state.loadStack);
  const [stacks, setStacks] = useState<SavedStackSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const targetLabelMap = useMemo(
    () => new Map(TARGET_OPTIONS.map((target) => [target.id, target.label])),
    []
  );

  const refreshStacks = useCallback(async () => {
    if (!enabled) {
      setStacks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stacks", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load saved stacks.");
      }

      setStacks(payload.stacks);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load saved stacks.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refreshStacks();
  }, [refreshStacks, refreshToken]);

  const handleLoad = (stack: SavedStackSummary) => {
    const restoredItems: BasketItem[] = stack.items.map((item, index) => ({
      id: item.catalogItemId || `${stack.id}:${index}:${item.snapshotDisplayName}`,
      name: item.snapshotDisplayName,
      description: "",
      type: item.catalogItemType,
    }));

    loadStack(restoredItems, stack.targetIds);
    toast.success(`Loaded ${stack.name} into your basket.`);
  };

  const handleDelete = async (stackId: string) => {
    setDeletingId(stackId);
    try {
      const response = await fetch(`/api/stacks/${stackId}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete stack.");
      }

      setStacks((current) => current.filter((stack) => stack.id !== stackId));
      toast.success("Saved stack deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete stack.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (stack: SavedStackSummary) => {
    const nextName = window.prompt("Rename stack", stack.name)?.trim();
    if (!nextName || nextName === stack.name) {
      return;
    }

    setRenamingId(stack.id);
    try {
      const response = await fetch(`/api/stacks/${stack.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to rename stack.");
      }

      setStacks((current) =>
        current.map((entry) => (entry.id === stack.id ? { ...entry, name: payload.name } : entry))
      );
      toast.success("Saved stack renamed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename stack.");
    } finally {
      setRenamingId(null);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className={cn("space-y-3 border-t border-border/70 pt-5", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Saved stacks
        </p>
        <button
          type="button"
          onClick={() => void refreshStacks()}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading && stacks.length === 0 ? (
        <div className="flex items-center gap-2 border border-border/60 bg-background/30 px-3 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading saved stacks...
        </div>
      ) : stacks.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-background/25 px-4 py-5 text-sm text-muted-foreground">
          Your saved stacks will appear here after you save one.
        </div>
      ) : (
        <div className="space-y-2">
          {stacks.map((stack) => (
            <div key={stack.id} className="border border-border/60 bg-background/25 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{stack.name}</p>
                  {stack.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{stack.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void handleRename(stack)}
                    disabled={renamingId === stack.id}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    aria-label={`Rename ${stack.name}`}
                  >
                    {renamingId === stack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(stack.id)}
                    disabled={deletingId === stack.id}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                    aria-label={`Delete ${stack.name}`}
                  >
                    {deletingId === stack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex border border-border/60 bg-background/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stack.itemCount} items
                </span>
                {stack.targetIds.map((targetId) => (
                  <span
                    key={targetId}
                    className="inline-flex border border-accent/20 bg-accent/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent"
                  >
                    {targetLabelMap.get(targetId) ?? targetId}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="truncate text-xs text-muted-foreground">
                  {stack.items.slice(0, 2).map((item) => item.snapshotDisplayName).join(", ")}
                  {stack.items.length > 2 ? ` +${stack.items.length - 2} more` : ""}
                </div>

                <button
                  type="button"
                  onClick={() => handleLoad(stack)}
                  className="inline-flex items-center gap-2 border border-border/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
