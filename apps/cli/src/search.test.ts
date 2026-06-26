import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

let consoleOutput: string[] = [];
const originalLog = console.log;

describe("runSearch", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    mockFetch.mockReset();
    consoleOutput = [];
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    console.log = originalLog;
    process.env = originalEnv;
  });

  it("warns on empty query", async () => {
    const { runSearch } = await import("./search.js");
    await runSearch("   ");

    expect(consoleOutput.some((line) => line.includes("Usage:"))).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("uses default API URL when env var is not set", async () => {
    process.env.VIBEBASKET_API_URL = undefined;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], pagination: { total: 0 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("github-mcp");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://vibebasket.dev/api/catalog"),
      expect.any(Object),
    );
  });

  it("uses custom API URL from VIBEBASKET_API_URL env var", async () => {
    process.env.VIBEBASKET_API_URL = "https://custom-api.example.com";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], pagination: { total: 0 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("test");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://custom-api.example.com/api/catalog"),
      expect.any(Object),
    );
  });

  it("URL-encodes the search query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], pagination: { total: 0 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("github mcp server");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("q=github%20mcp%20server"),
      expect.any(Object),
    );
  });

  it("parses and displays search results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          { type: "mcp", displayName: "GitHub MCP", description: "GitHub API integration" },
          { type: "skill", displayName: "React Patterns", description: null },
        ],
        pagination: { total: 2 },
      }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("github");

    expect(consoleOutput.some((line) => line.includes("[MCP]"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("[SKILL]"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("GitHub MCP"))).toBe(true);
    expect(consoleOutput.some((line) => line.includes("React Patterns"))).toBe(true);
  });

  it("shows 'No results found' for empty response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], pagination: { total: 0 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("nonexistent12345");

    expect(consoleOutput.some((line) => line.includes("No results found"))).toBe(true);
  });

  it("shows pages overflow hint when total exceeds limit", async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      type: "mcp" as const,
      displayName: `MCP ${i}`,
      description: `Description ${i}`,
    }));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items, pagination: { total: 50 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("popular");

    expect(consoleOutput.some((line) => line.includes("50 total results"))).toBe(true);
  });

  it("handles HTTP error from catalog API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    const { runSearch } = await import("./search.js");
    await runSearch("test");

    expect(consoleOutput.some((line) => line.includes("Catalog API returned an error"))).toBe(true);
    expect(
      consoleOutput.some((line) => line.includes("VIBEBASKET_API_URL=https://vibebasket.dev")),
    ).toBe(true);
    expect(consoleOutput.some((line) => line.includes("coming soon"))).toBe(false);
  });

  it("handles network timeout / fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("The operation was aborted"));

    const { runSearch } = await import("./search.js");
    await runSearch("test");

    expect(consoleOutput.some((line) => line.includes("Could not reach the catalog API"))).toBe(
      true,
    );
  });

  it("uses a 10-second abort timeout for fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], pagination: { total: 0 } }),
    });

    const { runSearch } = await import("./search.js");
    await runSearch("test");

    const fetchArgs = mockFetch.mock.calls[0];
    expect(fetchArgs[1]).toHaveProperty("signal");
    expect(fetchArgs[1].signal).toBeInstanceOf(AbortSignal);
  });
});
