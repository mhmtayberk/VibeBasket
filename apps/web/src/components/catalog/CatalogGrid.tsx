"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "./ItemCard";
import type { BasketItem } from "@/store/basketStore";

export function CatalogGrid() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog")
      .then(res => res.json())
      .then(data => {
        setItems(data.map((item: any) => ({
          id: item.id,
          type: item.type,
          name: item.displayName,
          description: item.description,
          icon: item.icon,
          mcpData: item.data
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch catalog:", err);
        setLoading(false);
      });
  }, []);

  const mcps = items.filter(i => i.type === "mcp");
  const skills = items.filter(i => i.type === "skill");
  const rules = items.filter(i => i.type === "rule");

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 px-4 text-center text-muted-foreground animate-pulse">
        Loading catalog...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-8">
      <Tabs defaultValue="mcps" className="w-full">
        <div className="flex justify-center mb-12">
          <TabsList className="bg-secondary/20 border border-border/50 p-1.5 rounded-2xl">
            <TabsTrigger 
              value="mcps" 
              className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all"
            >
              MCP Servers
            </TabsTrigger>
            <TabsTrigger 
              value="skills"
              className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all"
            >
              Claude Skills
            </TabsTrigger>
            <TabsTrigger 
              value="rules"
              className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all"
            >
              Project Rules
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mcps" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mcps.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((item) => (
              <ItemCard key={item.id} item={item as BasketItem} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((item) => (
              <ItemCard key={item.id} item={item as BasketItem} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
