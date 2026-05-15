import { beforeEach, describe, expect, it } from "vitest";
import { useBasketStore, type BasketItem } from "./basketStore";

const sampleItem: BasketItem = {
  id: "mcp-github",
  type: "mcp",
  name: "GitHub",
  description: "GitHub MCP",
};

describe("basketStore", () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] });
  });

  it("toggles a selected item off on the second toggle", () => {
    useBasketStore.getState().toggleItem(sampleItem);
    expect(useBasketStore.getState().items).toHaveLength(1);

    useBasketStore.getState().toggleItem(sampleItem);
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("reports selection state from current items", () => {
    expect(useBasketStore.getState().isSelected(sampleItem.id)).toBe(false);
    useBasketStore.getState().addItem(sampleItem);
    expect(useBasketStore.getState().isSelected(sampleItem.id)).toBe(true);
  });
});
