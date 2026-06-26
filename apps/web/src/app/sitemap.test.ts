import { describe, expect, it } from "vitest";
import { isMissingCatalogTableError } from "./sitemap";

describe("isMissingCatalogTableError", () => {
  it("detects the expected first-build SQLite missing-table case", () => {
    const error = new Error(
      'Failed query: select "last_synced_at" from "catalog_items" ... SQLITE_ERROR: no such table: catalog_items',
    );

    expect(isMissingCatalogTableError(error)).toBe(true);
  });

  it("does not swallow unrelated database errors", () => {
    const error = new Error("SQLITE_BUSY: database is locked");

    expect(isMissingCatalogTableError(error)).toBe(false);
  });

  it("supports raw string errors defensively", () => {
    expect(isMissingCatalogTableError("SQLITE_ERROR: no such table: catalog_items")).toBe(true);
  });
});
