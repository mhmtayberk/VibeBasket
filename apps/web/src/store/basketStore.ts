import type { McpEntry, RuleEntry, SkillEntry } from "@vibebasket/core";
import { create } from "zustand";
import { type StateStorage, createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_TARGET_IDS, isSupportedTargetId } from "../lib/targets";

export interface BasketItemTrust {
  tier: "verified" | "official" | "community";
  label: string;
  detail: string;
  sourceLabel: string;
  lastSyncedAt?: string;
}

export interface BasketItemSourceMeta {
  hint?: string;
}

export interface BasketItem {
  type: "mcp" | "skill" | "rule" | "workflow";
  id: string;
  name: string;
  description: string;
  icon?: string;
  mcpData?: McpEntry;
  skillData?: SkillEntry;
  ruleData?: RuleEntry;
  trust?: BasketItemTrust;
  sourceMeta?: BasketItemSourceMeta;
}

interface BasketState {
  items: BasketItem[];
  targetIds: string[];
  addItem: (item: BasketItem) => void;
  removeItem: (id: string) => void;
  isSelected: (id: string) => boolean;
  toggleItem: (item: BasketItem) => void;
  setTargetIds: (targetIds: string[]) => void;
  toggleTargetId: (targetId: string) => void;
  loadStack: (items: BasketItem[], targetIds: string[]) => void;
  clearBasket: () => void;
}

const fallbackStorageData = new Map<string, string>();

const fallbackStorage: StateStorage = {
  getItem: (name) => fallbackStorageData.get(name) ?? null,
  setItem: (name, value) => {
    fallbackStorageData.set(name, value);
  },
  removeItem: (name) => {
    fallbackStorageData.delete(name);
  },
};

function getBasketStorage(): StateStorage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return fallbackStorage;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      targetIds: [...DEFAULT_TARGET_IDS],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      isSelected: (id) => get().items.some((item) => item.id === id),
      toggleItem: (item) =>
        set((state) => {
          if (state.items.some((existing) => existing.id === item.id)) {
            return {
              items: state.items.filter((existing) => existing.id !== item.id),
            };
          }
          return { items: [...state.items, item] };
        }),
      setTargetIds: (targetIds) =>
        set({
          targetIds: Array.from(new Set(targetIds)).filter((targetId) =>
            isSupportedTargetId(targetId),
          ),
        }),
      toggleTargetId: (targetId) =>
        set((state) => {
          if (!isSupportedTargetId(targetId)) {
            return state;
          }

          return state.targetIds.includes(targetId)
            ? { targetIds: state.targetIds.filter((id) => id !== targetId) }
            : { targetIds: [...state.targetIds, targetId] };
        }),
      loadStack: (items, targetIds) =>
        set(() => {
          const nextTargetIds = Array.from(new Set(targetIds)).filter((targetId) =>
            isSupportedTargetId(targetId),
          );

          return {
            items,
            targetIds: nextTargetIds.length > 0 ? nextTargetIds : [...DEFAULT_TARGET_IDS],
          };
        }),
      clearBasket: () => set({ items: [], targetIds: [...DEFAULT_TARGET_IDS] }),
    }),
    {
      name: "vibebasket-storage",
      storage: createJSONStorage(getBasketStorage),
    },
  ),
);
