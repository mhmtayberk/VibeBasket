"use client";

import { useBasketStore } from "@/store/basketStore";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FloatingBasket() {
  const { items } = useBasketStore();
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  const handleBuild = () => {
    // Fake the URL generation for now
    const url = "npx vibebasket apply https://vibebasket.dev/b/1a2b3c";
    navigator.clipboard.writeText(url);
    toast.success("Command copied to clipboard!");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-background/40 backdrop-blur-xl border border-border/50 shadow-2xl shadow-background/50 rounded-full p-2 pr-3 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground ml-1 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <ShoppingBasket className="w-6 h-6" />
        </div>
        
        <div className="flex flex-col mr-2">
          <span className="text-sm font-medium text-foreground">
            {items.length} {items.length === 1 ? "Item" : "Items"} Selected
          </span>
          <span className="text-xs text-muted-foreground">
            Ready to bundle
          </span>
        </div>

        <div className="h-8 w-px bg-border/50 mx-2" />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl font-medium px-6" />}>
            <Wand2 className="w-4 h-4 mr-2" />
            Build Bundle
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Your VibeBasket</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground uppercase bg-secondary px-2 py-1 rounded-md">{item.type}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleBuild} 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_rgba(34,197,94,0.2)] h-12 text-lg rounded-xl"
              >
                Generate Command
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
