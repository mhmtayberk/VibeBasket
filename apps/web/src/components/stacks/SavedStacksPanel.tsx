"use client";

import { TARGET_OPTIONS } from "@/lib/targets";
import { cn } from "@/lib/utils";
import { type BasketItem, useBasketStore } from "@/store/basketStore";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldCheck,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EditStackDialog } from "./EditStackDialog";

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
  userRole?: string;
};

export function SavedStacksPanel({
  enabled,
  className,
  refreshToken = 0,
  userRole,
}: SavedStacksPanelProps) {
  const loadStack = useBasketStore((state) => state.loadStack);
  const basketItems = useBasketStore((state) => state.items);
  const basketTargets = useBasketStore((state) => state.targetIds);

  const [stacks, setStacks] = useState<SavedStackSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingContentId, setUpdatingContentId] = useState<string | null>(null);
  const [editingStack, setEditingStack] = useState<SavedStackSummary | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const targetLabelMap = useMemo(
    () => new Map<string, string>(TARGET_OPTIONS.map((target) => [target.id, target.label])),
    [],
  );

  const refreshStacks = useCallback(
    async (targetPage = 1) => {
      if (!enabled || userRole === "admin") {
        setStacks([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/stacks?page=${targetPage}&limit=20`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load saved stacks.");
        }

        setStacks(payload.stacks.map((s: SavedStackSummary) => ({ ...s, items: s.items ?? [] })));
        setTotalPages(payload.pagination?.totalPages ?? 1);
        setPage(targetPage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load saved stacks.");
      } finally {
        setLoading(false);
      }
    },
    [enabled, userRole],
  );

  useEffect(() => {
    void refreshStacks();
  }, [refreshStacks]);

  useEffect(() => {
    if (refreshToken > 0) {
      void refreshStacks();
    }
  }, [refreshStacks, refreshToken]);

  const handleLoad = async (stack: SavedStackSummary) => {
    let items = stack.items;
    if (items.length === 0) {
      try {
        const res = await fetch(`/api/stacks/${stack.id}`);
        const data = await res.json();
        items = data.items;
      } catch {
        toast.error("Failed to load stack items.");
        return;
      }
    }
    if (!items || items.length === 0) return;

    const restoredItems: BasketItem[] = items.map((item, index) => ({
      id: item.catalogItemId || `${stack.id}:${index}:${item.snapshotDisplayName}`,
      name: item.snapshotDisplayName,
      description: "",
      type: item.catalogItemType,
    }));

    loadStack(restoredItems, stack.targetIds);
    toast.success(`Loaded ${stack.name} into your basket.`);
  };

  const handleDelete = async (stackId: string) => {
    if (!window.confirm("Are you sure you want to delete this saved stack?")) {
      return;
    }

    setDeletingId(stackId);
    try {
      const response = await fetch(`/api/stacks/${stackId}`, {
        method: "DELETE",
      });
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
  const handleEdit = async (stack: SavedStackSummary) => {
    let fullStack = stack;
    if (stack.items.length === 0) {
      try {
        const res = await fetch(`/api/stacks/${stack.id}`);
        const data = await res.json();
        fullStack = { ...stack, items: data.items, targetIds: data.targetIds };
      } catch {
        toast.error("Failed to load stack details.");
        return;
      }
    }
    setEditingStack(fullStack);
    setIsEditOpen(true);
  };

  const handleUpdateContent = async (stack: SavedStackSummary) => {
    if (basketItems.length === 0 || basketTargets.length === 0) {
      toast.error("Your basket is empty. Add at least one item and one IDE to update this stack.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to overwrite '${stack.name}' content with your current basket items and targets?`,
      )
    ) {
      return;
    }

    setUpdatingContentId(stack.id);
    try {
      const response = await fetch(`/api/stacks/${stack.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: basketItems.map((item) => item.id),
          targetIds: basketTargets,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update stack content.");
      }

      setStacks((current) =>
        current.map((entry) =>
          entry.id === stack.id
            ? {
                ...entry,
                itemCount: payload.itemCount,
                items: payload.items,
                targetIds: payload.targetIds,
              }
            : entry,
        ),
      );
      toast.success("Stack content successfully updated with current basket!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update stack content.");
    } finally {
      setUpdatingContentId(null);
    }
  };

  const handleCopyNpx = async (stackId: string) => {
    try {
      const command = `npx vibebasket apply ${window.location.origin}/api/stacks/${stackId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      }
      toast.success("NPX apply command copied to clipboard!");
    } catch {
      toast.error("Failed to copy command to clipboard.");
    }
  };

  if (!enabled) {
    return null;
  }

  if (enabled && userRole === "admin") {
    return (
      <div className={cn("space-y-4 border-t border-border/70 pt-5", className)}>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Admin Console
        </p>
        <div className="border border-border/60 bg-background/25 p-5 text-center rounded-[2px]">
          <div className="flex justify-center mb-3">
            <ShieldCheck className="h-8 w-8 text-accent animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Administrator Account</h3>
          <p className="text-xs text-muted-foreground leading-5 mb-5 max-w-xs mx-auto">
            Saved stacks are disabled for administrator sessions to prioritize systems security.
          </p>
          <Link
            href="/admin"
            className="inline-flex w-full items-center justify-center gap-2 border border-accent/40 hover:border-accent bg-accent/5 hover:bg-accent/15 px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-all duration-300 rounded-[2px]"
          >
            Go to Admin Panel
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 border-t border-border/70 pt-5", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Saved stacks
        </p>
        <button
          type="button"
          onClick={() => void refreshStacks(page)}
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
        <>
          <div className="space-y-2">
            {stacks.map((stack) => (
              <div key={stack.id} className="border border-border/60 bg-background/25 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{stack.name}</p>
                    {stack.description ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {stack.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(stack)}
                      className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      aria-label={`Edit ${stack.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(stack.id)}
                      disabled={deletingId === stack.id}
                      className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                      aria-label={`Delete ${stack.name}`}
                    >
                      {deletingId === stack.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
                  <span className="text-xs text-muted-foreground">
                    {stack.itemCount} item{stack.itemCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLoad(stack)}
                    className="inline-flex items-center gap-2 border border-border/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Load
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void handleUpdateContent(stack)}
                    disabled={updatingContentId === stack.id || basketItems.length === 0}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent disabled:opacity-40"
                  >
                    {updatingContentId === stack.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Update Content
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyNpx(stack.id)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-accent hover:text-[#a0fdda] transition-colors"
                  >
                    <TerminalSquare className="h-3.5 w-3.5" />
                    Copy NPX
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => refreshStacks(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <span className="font-mono text-[10px] text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => refreshStacks(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}

      <EditStackDialog
        stack={editingStack}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaved={(updatedStack) => {
          setStacks((current) =>
            current.map((entry) => (entry.id === updatedStack.id ? updatedStack : entry)),
          );
        }}
      />
    </div>
  );
}
