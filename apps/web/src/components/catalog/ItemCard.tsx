"use client";

import { Check, FileText, Server, Sparkles } from "lucide-react";
import { useBasketStore, type BasketItem } from "@/store/basketStore";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: BasketItem;
}

function ItemIcon({ type }: Pick<BasketItem, "type">) {
  if (type === "mcp") {
    return <Server className="h-4 w-4" />;
  }
  if (type === "skill") {
    return <Sparkles className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
}

export function ItemCard({ item }: ItemCardProps) {
  const toggleItem = useBasketStore((s) => s.toggleItem);
  const selected = useBasketStore((s) => s.items.some((existing) => existing.id === item.id));
  const trustTone =
    item.trust?.tier === "verified"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : item.trust?.tier === "official"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
        : "border-border/70 bg-background/50 text-muted-foreground";

  return (
    <button
      type="button"
      onClick={() => toggleItem(item)}
      aria-pressed={selected}
      className={cn(
        "group relative w-full border border-border/80 bg-card/80 px-4 py-4 text-left transition-colors duration-200",
        "hover:border-accent/40 hover:bg-card",
        selected && "border-accent bg-accent/5"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-0.5 bg-transparent transition-colors",
          selected && "bg-accent"
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center border border-border/70 bg-background/60 text-muted-foreground transition-colors",
              selected && "border-accent/60 bg-accent/10 text-accent"
            )}
          >
            <ItemIcon type={item.type} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "truncate text-base font-semibold transition-colors",
                  selected ? "text-foreground" : "text-foreground/95"
                )}
              >
                {item.name}
              </h3>
              <span className="inline-flex border border-border/70 bg-background/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {item.type}
              </span>
              {item.trust ? (
                <span
                  title={item.trust.detail}
                  className={cn(
                    "inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
                    trustTone
                  )}
                >
                  {item.trust.label}
                </span>
              ) : null}
              {selected ? (
                <span className="inline-flex border border-accent/60 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  Selected
                </span>
              ) : null}
            </div>

            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {item.description || "Trusted catalog component ready to bundle into your AI dev setup."}
            </p>

            {item.trust ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-muted-foreground">{item.trust.sourceLabel}</span>
                {item.sourceMeta?.hint ? (
                  <span className="truncate text-muted-foreground/90">{item.sourceMeta.hint}</span>
                ) : null}
                <span className="text-muted-foreground">Trust score {item.trust.score}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center border transition-colors",
            selected
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border/70 bg-background/40 text-muted-foreground group-hover:border-accent/40"
          )}
        >
          {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
        </div>
      </div>
    </button>
  );
}
