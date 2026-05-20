"use client";

import { useState } from "react";
import { Layers3 } from "lucide-react";
import type { EnabledAuthProvider } from "@/auth.config";
import { useBasketStore } from "@/store/basketStore";
import { BasketPanel } from "./BasketPanel";

type FloatingBasketProps = {
  isSignedIn?: boolean;
  enabledProviders?: EnabledAuthProvider[];
};

export function FloatingBasket({
  isSignedIn = false,
  enabledProviders = [],
}: FloatingBasketProps) {
  const items = useBasketStore((s) => s.items);
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] -translate-x-1/2 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between border border-border/80 bg-card/95 px-4 py-3 backdrop-blur-md transition-colors hover:border-accent/50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center border border-accent/60 bg-accent/10 text-accent">
              <Layers3 className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Basket
              </p>
              <p className="text-sm font-medium text-foreground">
                {items.length} selected component{items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Open
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <BasketPanel
              variant="modal"
              onClose={() => setIsOpen(false)}
              isSignedIn={isSignedIn}
              enabledProviders={enabledProviders}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
