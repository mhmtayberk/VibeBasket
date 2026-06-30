import { describe, expect, it } from "vitest";
import { metadata } from "./forbidden";

describe("forbidden metadata", () => {
  it("is excluded from indexing", () => {
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
