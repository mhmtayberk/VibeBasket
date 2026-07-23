"use client";

import { getLocalVibeBasketMcpSnippet } from "@vibebasket/core/local-mcp-snippets";
import { useMemo, useState } from "react";

type ExampleTargetId = "cursor" | "continue" | "codex" | "claude-code" | "zed" | "goose";

type ExampleTarget = {
  id: ExampleTargetId;
  label: string;
};

type McpSnippetPreviewProps = {
  targets: ExampleTarget[];
  footnote: string;
};

export function McpSnippetPreview({ targets, footnote }: McpSnippetPreviewProps) {
  const [activeTargetId, setActiveTargetId] = useState<ExampleTargetId>(targets[0]?.id ?? "cursor");

  const activeTarget = targets.find((target) => target.id === activeTargetId) ?? targets[0];
  const snippet = useMemo(
    () => getLocalVibeBasketMcpSnippet(activeTarget?.id ?? "cursor"),
    [activeTarget?.id],
  );

  return (
    <div>
      <div className="-mx-1 mb-4 flex overflow-x-auto px-1 pb-2">
        <div className="inline-flex min-w-max gap-2">
          {targets.map((target) => {
            const isActive = target.id === activeTargetId;
            return (
              <button
                key={target.id}
                type="button"
                onClick={() => setActiveTargetId(target.id)}
                className={
                  isActive
                    ? "inline-flex min-h-10 items-center border border-[#a0fdda]/60 bg-[#132019] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#f4fbf7]"
                    : "inline-flex min-h-10 items-center border border-[#3e4944] bg-[#101412] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8da79a] transition-colors hover:border-[#a0fdda]/40 hover:text-[#dff7ea]"
                }
                aria-pressed={isActive}
              >
                {target.label}
              </button>
            );
          })}
        </div>
      </div>

      <article className="border border-[#3e4944] bg-[#101412]">
        <div className="border-b border-[#3e4944] px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a0fdda]">
            {activeTarget?.label}
          </div>
          <div className="mt-1 text-xs text-[#8da79a]">{snippet.rootField}</div>
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[11px] leading-relaxed text-[#dff7ea]">
          <code>{snippet.snippet}</code>
        </pre>
      </article>

      <p className="mt-4 text-xs leading-relaxed text-[#8da79a]">{footnote}</p>
    </div>
  );
}
