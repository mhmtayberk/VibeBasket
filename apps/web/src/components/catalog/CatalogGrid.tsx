"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "./ItemCard";
import type { BasketItem } from "@/store/basketStore";
import { useDebounce } from "@/hooks/use-debounce"; // I'll create this

export function CatalogGrid() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchCatalog = useCallback(async (pageNum: number, search: string, isAppend = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/catalog?page=${pageNum}&limit=12&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      
      const newItems = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        name: item.displayName,
        description: item.description,
        icon: item.icon,
        mcpData: item.data
      }));

      if (newItems.length < 12) setHasMore(false);
      else setHasMore(true);

      setItems(prev => isAppend ? [...prev, ...newItems] : newItems);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchCatalog(1, debouncedSearch, false);
  }, [debouncedSearch, fetchCatalog]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCatalog(nextPage, debouncedSearch, true);
  };

  const mcps = items.filter(i => i.type === "mcp");
  const skills = items.filter(i => i.type === "skill");
  const rules = items.filter(i => i.type === "rule");

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-8">
      <div className="relative max-w-md mx-auto mb-12 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
        <Input 
          type="text"
          placeholder="Search MCPs, Skills, Rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 rounded-2xl bg-secondary/20 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      <Tabs defaultValue="mcps" className="w-full">
        <div className="flex justify-center mb-12 px-2">
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-hide pb-2">
            <TabsList className="bg-secondary/20 border border-border/50 p-1.5 rounded-2xl inline-flex min-w-full sm:min-w-0">
              <TabsTrigger 
                value="mcps" 
                className="rounded-xl px-4 sm:px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap shrink-0"
              >
                MCP Servers
              </TabsTrigger>
              <TabsTrigger 
                value="skills"
                className="rounded-xl px-4 sm:px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap shrink-0"
              >
                Skills
              </TabsTrigger>
              <TabsTrigger 
                value="rules"
                className="rounded-xl px-4 sm:px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap shrink-0"
              >
                Project Rules
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : (
          <>
            <TabsContent value="mcps" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              {mcps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mcps.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">No MCP servers found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="skills" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              {skills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.map((item) => (
                    <ItemCard key={item.id} item={item as BasketItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">No Skills found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rules" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              {rules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rules.map((item) => (
                    <ItemCard key={item.id} item={item as BasketItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">No Rules found.</p>
                </div>
              )}
            </TabsContent>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  variant="outline"
                  className="rounded-full px-8 h-12 border-border/50 hover:bg-secondary/50"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}
