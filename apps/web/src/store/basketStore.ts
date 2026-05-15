import { create } from "zustand";
import { persist } from "zustand/middleware";
import { McpEntrySchema } from "@vibebasket/core";
import { z } from "zod";

type McpEntry = z.infer<typeof McpEntrySchema>;

export interface BasketItem {
  type: "mcp" | "skill" | "rule" | "workflow";
  id: string;
  name: string;
  description: string;
  icon?: string;
  mcpData?: McpEntry; // Populated if type === "mcp"
}

interface BasketState {
  items: BasketItem[];
  addItem: (item: BasketItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  toggleItem: (item: BasketItem) => void;
  clearBasket: () => void;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (state.items.find((i) => i.id === item.id)) return state;
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      hasItem: (id) => get().items.some((item) => item.id === id),
      isSelected: (id) => get().items.some((item) => item.id === id),
      toggleItem: (item) => set((state) => {
        if (state.items.some((existing) => existing.id === item.id)) {
          return {
            items: state.items.filter((existing) => existing.id !== item.id),
          };
        }
        return { items: [...state.items, item] };
      }),
      clearBasket: () => set({ items: [] }),
    }),
    {
      name: "vibebasket-storage",
    }
  )
);
