"use client";

import { useBasketStore } from "@/store/basketStore";
import { useState } from "react";
import { toast } from "sonner";

export function FloatingBasket() {
  const items = useBasketStore((s) => s.items);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const removeItem = useBasketStore((s) => s.removeItem);
  const [isOpen, setIsOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [bundleUrl, setBundleUrl] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleBuild = async () => {
    setIsBuilding(true);
    try {
      const response = await fetch("/api/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targets: ["cursor", "vscode", "windsurf", "antigravity"],
          scope: "user",
          itemIds: items.map((i) => i.id),
        }),
      });
      if (!response.ok) throw new Error("Failed to build bundle");
      const data = await response.json();
      const command = `npx vibebasket apply ${data.url}`;
      setBundleUrl(command);
      navigator.clipboard.writeText(command);
      toast.success("Command copied to clipboard!");
    } catch {
      toast.error("Failed to generate bundle command.");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all items from your basket?")) {
      clearBasket();
      setIsOpen(false);
      toast.success("Basket cleared");
    }
  };

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto">
        <div className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full p-2 pr-3 flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
          {/* Basket icon */}
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent text-white ml-1 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2Z"/><path d="m3.5 15.5 1.5 5h14l1.5-5"/>
            </svg>
          </div>

          <div className="flex flex-col mr-1 sm:mr-2 overflow-hidden">
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Ready to bundle
            </span>
          </div>

          <div className="h-8 w-px bg-border/50 mx-1 shrink-0" />

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground shrink-0"
            title="Clear basket"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>

          {/* Build button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-white text-black hover:bg-white/90 font-medium px-4 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm flex items-center gap-1.5 transition-all hover:scale-105 shadow-xl shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/>
            </svg>
            Build
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Dialog */}
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-6">Your VibeBasket</h2>

            {/* Items list */}
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{item.type}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 ml-2 text-muted-foreground hover:text-red-500 transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Bundle command */}
            {bundleUrl && (
              <div className="bg-secondary/50 p-3 rounded-xl mb-4 font-mono text-[11px] border border-border/50 overflow-x-auto whitespace-nowrap select-all">
                {bundleUrl}
              </div>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={handleBuild}
              disabled={isBuilding}
              className="w-full h-12 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isBuilding && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" strokeLinecap="round"/>
                </svg>
              )}
              {isBuilding ? "Building..." : bundleUrl ? "Copy Command" : "Generate Command"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
