"use client";

import { useBasketStore, type BasketItem } from "@/store/basketStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Box, Globe, Database, GitBranch, BrainCircuit, Code2, Palette, FileCode2 } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Globe, Database, Github: GitBranch, BrainCircuit, Code2, Palette, FileCode2
};

interface ItemCardProps {
  item: BasketItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { hasItem, addItem, removeItem } = useBasketStore();
  const selected = hasItem(item.id);

  const toggleSelection = () => {
    if (selected) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const IconComponent = item.icon ? iconMap[item.icon] || Box : Box;

  return (
    <Card 
      onClick={toggleSelection}
      className={cn(
        "relative overflow-hidden cursor-pointer group transition-all duration-300 ease-out border-border/50",
        "hover:border-accent/50 hover:bg-secondary/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5",
        selected && "border-accent bg-accent/5 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
      )}
    >
      <div className="absolute top-4 right-4 z-10">
        <Checkbox 
          checked={selected} 
          onCheckedChange={toggleSelection} 
          className={cn(
            "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:border-accent",
            "transition-all duration-200"
          )}
        />
      </div>

      <CardHeader className="p-6 relative z-0">
        <div className="flex items-center gap-4 mb-3">
          <div className={cn(
            "p-2.5 rounded-xl border flex items-center justify-center transition-colors duration-300",
            selected 
              ? "bg-accent text-accent-foreground border-accent" 
              : "bg-secondary/50 border-border/50 text-muted-foreground group-hover:text-foreground"
          )}>
            <IconComponent className="w-5 h-5" />
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight leading-none text-foreground/90 group-hover:text-foreground transition-colors">
            {item.name}
          </CardTitle>
        </div>
        
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </CardDescription>
      </CardHeader>
      
      {/* Subtle bottom glow effect when selected */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none" />
      )}
    </Card>
  );
}
