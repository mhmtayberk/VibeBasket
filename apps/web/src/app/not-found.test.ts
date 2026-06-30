import { describe, expect, it } from "vitest";
import { metadata } from "./not-found";

describe("not-found metadata", () => {
  it("is excluded from indexing", () => {
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
