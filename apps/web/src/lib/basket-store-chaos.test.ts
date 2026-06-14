import { type BasketItem, useBasketStore } from "@/store/basketStore";
import { beforeEach, describe, expect, it } from "vitest";

function makeItem(overrides: { id: string; type: BasketItem["type"] }): BasketItem {
  return {
    id: overrides.id,
    type: overrides.type,
    name: `Item ${overrides.id}`,
    description: "A test item for chaos testing",
  };
}

describe("Basket Store — Concurrency & Stress", () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [], targetIds: ["cursor"] });
  });

  it("adds and removes items atomically", () => {
    const item = makeItem({ id: "test-1", type: "mcp" });
    useBasketStore.getState().addItem(item);
    expect(useBasketStore.getState().items).toHaveLength(1);

    useBasketStore.getState().removeItem(item.id);
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("adding same item twice does not duplicate", () => {
    const item = makeItem({ id: "dup-1", type: "mcp" });
    useBasketStore.getState().addItem(item);
    useBasketStore.getState().addItem(item);
    useBasketStore.getState().addItem(item);
    expect(useBasketStore.getState().items).toHaveLength(1);
  });

  it("handles rapid add/remove cycles", () => {
    const items: BasketItem[] = Array.from({ length: 20 }, (_, i) =>
      makeItem({ id: `rapid-${i}`, type: i % 2 === 0 ? "mcp" : "skill" }),
    );

    for (const item of items) {
      useBasketStore.getState().addItem(item);
    }
    expect(useBasketStore.getState().items).toHaveLength(20);

    for (const item of items) {
      useBasketStore.getState().removeItem(item.id);
    }
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("isSelected returns correct boolean", () => {
    expect(useBasketStore.getState().isSelected("any-id")).toBe(false);

    const mcp = makeItem({ id: "mcp-1", type: "mcp" });
    useBasketStore.getState().addItem(mcp);
    expect(useBasketStore.getState().isSelected("mcp-1")).toBe(true);
    expect(useBasketStore.getState().isSelected("other-id")).toBe(false);
  });

  it("clears basket completely", () => {
    useBasketStore.getState().addItem(makeItem({ id: "clear-1", type: "mcp" }));
    useBasketStore.getState().addItem(makeItem({ id: "clear-2", type: "skill" }));
    useBasketStore.getState().addItem(makeItem({ id: "clear-3", type: "rule" }));
    expect(useBasketStore.getState().items).toHaveLength(3);

    useBasketStore.getState().clearBasket();
    expect(useBasketStore.getState().items).toHaveLength(0);
    expect(useBasketStore.getState().targetIds.length).toBeGreaterThan(0);
  });

  it("toggleTarget removes if already selected", () => {
    const initial = useBasketStore.getState().targetIds.length;
    expect(useBasketStore.getState().targetIds).toContain("cursor");

    useBasketStore.getState().toggleTargetId("cursor");
    expect(useBasketStore.getState().targetIds).not.toContain("cursor");

    useBasketStore.getState().toggleTargetId("cursor");
    expect(useBasketStore.getState().targetIds).toContain("cursor");
  });

  it("handles 1000 items stress", () => {
    const types = ["mcp", "skill", "rule"] as const;
    const items: BasketItem[] = Array.from({ length: 1000 }, (_, i) =>
      makeItem({ id: `stress-${i}`, type: types[i % 3] }),
    );

    for (const item of items) {
      useBasketStore.getState().addItem(item);
    }
    expect(useBasketStore.getState().items).toHaveLength(1000);

    useBasketStore.getState().clearBasket();
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("loadStack filters unsupported target IDs", () => {
    const items: BasketItem[] = [
      makeItem({ id: "stack-1", type: "mcp" }),
      makeItem({ id: "stack-2", type: "skill" }),
    ];

    useBasketStore.getState().loadStack(items, ["cursor", "nonexistent-target-xyz"]);
    expect(useBasketStore.getState().targetIds).toContain("cursor");
    expect(useBasketStore.getState().targetIds).not.toContain("nonexistent-target-xyz");
  });
});

describe("Basket Store — Edge Cases", () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [], targetIds: ["cursor"] });
  });

  it("removeItem for non-existent ID is no-op", () => {
    useBasketStore.getState().addItem(makeItem({ id: "exist-1", type: "mcp" }));
    expect(useBasketStore.getState().items).toHaveLength(1);
    useBasketStore.getState().removeItem("nonexistent-id-12345");
    expect(useBasketStore.getState().items).toHaveLength(1);
  });

  it("toggleItem adds if not present, removes if present", () => {
    const item = makeItem({ id: "toggle-1", type: "mcp" });

    useBasketStore.getState().toggleItem(item);
    expect(useBasketStore.getState().items).toHaveLength(1);

    useBasketStore.getState().toggleItem(item);
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("handles items with very long IDs", () => {
    const longId = `item-${"a".repeat(500)}`;
    const item = makeItem({ id: longId, type: "mcp" });
    useBasketStore.getState().addItem(item);
    expect(useBasketStore.getState().isSelected(longId)).toBe(true);
    useBasketStore.getState().removeItem(longId);
    expect(useBasketStore.getState().items).toHaveLength(0);
  });

  it("handles items with empty name", () => {
    const item = { ...makeItem({ id: "empty-name", type: "mcp" }), name: "" };
    useBasketStore.getState().addItem(item);
    expect(useBasketStore.getState().items).toHaveLength(1);
  });

  it("handles items with long description", () => {
    const item = {
      ...makeItem({ id: "long-desc", type: "mcp" }),
      description: "x".repeat(10000),
    };
    useBasketStore.getState().addItem(item);
    expect(useBasketStore.getState().items).toHaveLength(1);
  });

  it("supports all 4 item types", () => {
    useBasketStore.getState().addItem(makeItem({ id: "t1", type: "mcp" }));
    useBasketStore.getState().addItem(makeItem({ id: "t2", type: "skill" }));
    useBasketStore.getState().addItem(makeItem({ id: "t3", type: "rule" }));
    useBasketStore.getState().addItem(makeItem({ id: "t4", type: "workflow" }));

    expect(useBasketStore.getState().items).toHaveLength(4);
    const types = useBasketStore
      .getState()
      .items.map((i) => i.type)
      .sort();
    expect(types).toEqual(["mcp", "rule", "skill", "workflow"]);
  });
});
