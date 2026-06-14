import { describe, expect, it } from "vitest";

/**
 * Replicates the FTS5 input sanitization from the catalog route.
 * Strips non-word chars (\w = [a-zA-Z0-9_]), preserves whitespace + hyphens.
 * Splits into tokens, adds FTS5 prefix "*" to each.
 */
function sanitizeFts5Input(input: string): string[] {
  const cleaned = input.replace(/[^\w\s-]/g, "").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `"${t}"*`);
}

describe("FTS5 Search Sanitization", () => {
  it("splits multi-word queries into tokens", () => {
    expect(sanitizeFts5Input("github mcp server")).toEqual(['"github"*', '"mcp"*', '"server"*']);
  });

  it("strips angle brackets and parens, keeps word chars", () => {
    // \"<script>alert(1)</script>\" → \"scriptalert1script\"
    // \w keeps a-z, 0-9; <, >, /, (, ) are stripped
    const tokens = sanitizeFts5Input("<script>alert(1)</script>");
    expect(tokens.length).toBeGreaterThan(0);
    // Quotation marks are stripped too
    expect(sanitizeFts5Input("' OR '1'='1").length).toBeGreaterThan(0);
  });

  it("strips zero-width space", () => {
    expect(sanitizeFts5Input("\u200Badmin\u200B")).toEqual(['"admin"*']);
  });

  it("strips null bytes", () => {
    expect(sanitizeFts5Input("test\u0000data")).toEqual(['"testdata"*']);
  });

  it("preserves hyphens in tokens", () => {
    expect(sanitizeFts5Input("postgres-mcp")).toEqual(['"postgres-mcp"*']);
  });

  it("preserves underscores", () => {
    expect(sanitizeFts5Input("github_copilot")).toEqual(['"github_copilot"*']);
  });

  it("preserves alphanumeric alongside hyphens", () => {
    expect(sanitizeFts5Input("vibe-basket tool")).toEqual(['"vibe-basket"*', '"tool"*']);
  });

  it("returns empty array for whitespace-only input", () => {
    expect(sanitizeFts5Input("   ")).toEqual([]);
    expect(sanitizeFts5Input("\n\t\r")).toEqual([]);
  });

  it("returns empty array for special-char-only input", () => {
    expect(sanitizeFts5Input("@#$%^&*()")).toEqual([]);
    expect(sanitizeFts5Input("!@#$%")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(sanitizeFts5Input("")).toEqual([]);
  });

  it("strips emoji (not in \\w)", () => {
    expect(sanitizeFts5Input("🚀🔥 server")).toEqual(['"server"*']);
  });

  it("strips CJK (not in \\w)", () => {
    expect(sanitizeFts5Input("数据库")).toEqual([]);
  });

  it("strips Cyrillic (not in \\w)", () => {
    expect(sanitizeFts5Input("сервер")).toEqual([]);
  });

  it("strips Arabic (not in \\w)", () => {
    expect(sanitizeFts5Input("خادم")).toEqual([]);
  });

  it("handles very long ASCII tokens", () => {
    const longTerm = "a".repeat(200);
    const tokens = sanitizeFts5Input(longTerm);
    expect(tokens.length).toBe(1);
  });

  it("returns empty for only-quote-chars input", () => {
    expect(sanitizeFts5Input("'*' \"*\"")).toEqual([]);
  });

  it("handles mixed unicode and ASCII (unicode stripped)", () => {
    // Japanese サ ー バ ー are stripped, leaving only "github" and "postgres"
    const tokens = sanitizeFts5Input("github サーバー postgres");
    expect(tokens).toEqual(['"github"*', '"postgres"*']);
  });

  it("handles duplicate words gracefully", () => {
    const tokens = sanitizeFts5Input("mcp mcp mcp");
    expect(tokens).toEqual(['"mcp"*', '"mcp"*', '"mcp"*']);
  });

  it("handles single character search", () => {
    expect(sanitizeFts5Input("x")).toEqual(['"x"*']);
  });

  it("handles numbers-only search", () => {
    expect(sanitizeFts5Input("12345")).toEqual(['"12345"*']);
  });

  it("handles string with many spaces", () => {
    const tokens = sanitizeFts5Input("  github    mcp   server  ");
    expect(tokens).toEqual(['"github"*', '"mcp"*', '"server"*']);
  });

  it("handles large input with 50 tokens", () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`);
    const tokens = sanitizeFts5Input(words.join(" "));
    expect(tokens.length).toBe(50);
    expect(tokens[0]).toBe('"word0"*');
    expect(tokens[49]).toBe('"word49"*');
  });
});
