"use client";

import { useBasketStore } from "@/store/basketStore";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Wand2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FloatingBasket() {
  const { items } = useBasketStore();
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
          targets: ["cursor", "vscode", "windsurf", "antigravity"], // Default targets for now
          scope: "user", // Default scope for now
          itemIds: items.map(i => i.id),
        }),
      });

      if (!response.ok) throw new Error("Failed to build bundle");

      const data = await response.json();
      const command = `npx vibebasket apply https://vibebasket.dev/api/bundle/${data.id}`;
      setBundleUrl(command);
      navigator.clipboard.writeText(command);
      toast.success("Command copied to clipboard!");
    } catch (error) {
      console.error("Build failed:", error);
      toast.error("Failed to generate bundle command.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 w-[95%] sm:w-auto">
      <div className="bg-background/40 backdrop-blur-xl border border-border/50 shadow-2xl shadow-background/50 rounded-full p-2 pr-3 flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent text-accent-foreground ml-1 shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0">
          <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        
        <div className="flex flex-col mr-1 sm:mr-2 overflow-hidden">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
            Ready to bundle
          </span>
        </div>

        <div className="h-8 w-px bg-border/50 mx-1 sm:mx-2 shrink-0" />

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              const confirm = window.confirm("Clear all items?");
              if (confirm) useBasketStore.getState().clearBasket();
            }}
            className="w-10 h-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Clear basket"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl font-medium px-4 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm" />}>
            <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Build
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Your VibeBasket</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground uppercase bg-secondary px-2 py-1 rounded-md">{item.type}</span>
                  </div>
                ))}
              </div>
              
              {bundleUrl ? (
                <div className="bg-secondary/50 p-4 rounded-xl mb-4 font-mono text-[10px] sm:text-xs border border-border/50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {bundleUrl}
                </div>
              ) : null}

              <Button 
                onClick={handleBuild} 
                disabled={isBuilding}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_rgba(34,197,94,0.2)] h-12 text-lg rounded-xl"
              >
                {isBuilding ? "Building..." : (bundleUrl ? "Copy Clipboard" : "Generate Command")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
);
}
