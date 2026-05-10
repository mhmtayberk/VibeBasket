"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "./ItemCard";
import { mockCatalog } from "@/data/mockCatalog";
import type { BasketItem } from "@/store/basketStore";

export function CatalogGrid() {
  const mcps = mockCatalog.mcps.map(m => ({ ...m, type: "mcp" as const }));
  const skills = mockCatalog.skills.map(s => ({ ...s, type: "skill" as const }));
  const rules = mockCatalog.rules.map(r => ({ ...r, type: "rule" as const }));

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
