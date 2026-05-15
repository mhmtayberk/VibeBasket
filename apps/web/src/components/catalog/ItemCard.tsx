"use client";

import { useBasketStore, type BasketItem } from "@/store/basketStore";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: BasketItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const toggleItem = useBasketStore((s) => s.toggleItem);
  const selected = useBasketStore((s) => s.items.some((existing) => existing.id === item.id));

  return (
    <button
      type="button"
      onClick={() => toggleItem(item)}
      aria-pressed={selected}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group shadow-sm",
        "border-border/40 hover:border-accent/40 hover:bg-secondary/10",
        selected && "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(74,222,128,0.45)]"
      )}
    >
      <div className="flex flex-col gap-0.5 pr-4 min-w-0">
        <span className={cn(
          "text-sm font-semibold truncate transition-colors",
          selected ? "text-accent" : "text-foreground/90"
        )}>
          {item.name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {item.description}
        </span>
        {selected ? (
          <span className="mt-2 inline-flex w-fit rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            Selected
          </span>
        ) : null}
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <span className="hidden sm:inline-block text-[10px] font-medium uppercase text-muted-foreground/50 tracking-wider">
          {item.type}
        </span>
        <div className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
          selected
            ? "bg-accent border-accent text-white"
            : "border-border/50 bg-transparent"
        )}>
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
