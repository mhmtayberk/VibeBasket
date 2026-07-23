import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DocsTabMcp } from "./DocsTabMcp";

describe("DocsTabMcp", () => {
  it("renders native snippet examples for representative targets", () => {
    const html = renderToStaticMarkup(<DocsTabMcp locale="en" />);

    expect(html).toContain("Native config snippets");
    expect(html).toContain("Cursor / JSON");
    expect(html).toContain("Claude Code / JSON");
    expect(html).toContain("Continue / YAML");
    expect(html).toContain("Codex CLI / TOML");
    expect(html).toContain("&quot;mcpServers&quot;");
  });
});
