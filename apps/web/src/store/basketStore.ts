import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { McpEntry } from "@vibebasket/core";

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
      clearBasket: () => set({ items: [] }),
    }),
    {
      name: "vibebasket-storage",
    }
  )
);
