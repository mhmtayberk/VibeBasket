"use client";

import { isAllowedRemoteMcpUrl } from "@vibebasket/core";
import type { BasketItem } from "@/store/basketStore";
import { ExternalLink, Globe, X } from "lucide-react";

interface CatalogDetailProps {
  item: BasketItem;
  open: boolean;
  onClose: () => void;
}

function isGithubSource(
  data: unknown,
): data is { type: "github"; repo: string; path?: string; ref?: string } {
  return Boolean(
    data &&
      typeof data === "object" &&
      "type" in (data as Record<string, unknown>) &&
      (data as Record<string, unknown>).type === "github",
  );
}

function isNpmSource(data: unknown): data is { type: "npm"; package: string; version?: string } {
  return Boolean(
    data &&
      typeof data === "object" &&
      "type" in (data as Record<string, unknown>) &&
      (data as Record<string, unknown>).type === "npm",
  );
}

export function CatalogDetail({ item, open, onClose }: CatalogDetailProps) {
  if (!open) return null;

  const mcpData = item.mcpData;
  const safeRemoteUrl = mcpData?.url && isAllowedRemoteMcpUrl(mcpData.url) ? mcpData.url : null;
  const ruleData = item.ruleData;
  const skillData = item.skillData;
  const skillSource = skillData?.source;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close item details"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <dialog
        open
        className="relative z-10 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto border-t sm:border border-border/80 bg-card px-0 pb-0 shadow-[0_0_60px_rgba(0,0,0,0.9)] sm:rounded-[2px]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border/70 bg-card px-5 sm:px-6 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border shrink-0 ${
                  item.type === "mcp"
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-accent/30 bg-accent/10 text-accent"
                }`}
              >
                {item.type}
              </span>
              {item.trust && (
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 border ${
                    item.trust.tier === "verified"
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : item.trust.tier === "official"
                        ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
                        : "border-border/50 bg-background/30 text-muted-foreground"
                  }`}
                >
                  {item.trust.label}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          )}

          {/* Trust info */}
          {item.trust && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>
                {item.trust.sourceLabel} · {item.trust.detail}
              </span>
            </div>
          )}

          {/* MCP Installation */}
          {mcpData && item.type === "mcp" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Install Command
              </h3>
              <div className="border border-border/50 bg-background/30 p-4 font-mono text-[11px] text-foreground">
                <div>
                  <span className="text-accent">{mcpData.runtime}</span>
                  {mcpData.command ? (
                    <span className="text-muted-foreground"> {mcpData.command}</span>
                  ) : null}
                  {mcpData.args?.length ? (
                    <span className="text-muted-foreground"> {mcpData.args.join(" ")}</span>
                  ) : null}
                </div>
                {safeRemoteUrl && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">url:</span>{" "}
                    <a
                      href={safeRemoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {safeRemoteUrl}
                    </a>
                  </div>
                )}
                {mcpData.env && Object.keys(mcpData.env).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <span className="text-muted-foreground">env:</span>
                    {Object.entries(mcpData.env).map(([k, v]) => (
                      <div key={k} className="ml-2">
                        <span className="text-accent">{k}</span>=
                        <span className="text-muted-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {mcpData.requiredSecrets?.length ? (
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  Requires secrets: {mcpData.requiredSecrets.join(", ")}. Prompts locally by CLI.
                  Never sent to servers.
                </p>
              ) : null}
            </div>
          )}

          {/* Skill Source */}
          {skillSource && item.type === "skill" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Source
              </h3>
              <div className="border border-border/50 bg-background/30 p-4 space-y-1.5 font-mono text-[11px]">
                {isGithubSource(skillSource) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">repo</span>{" "}
                      <a
                        href={`https://github.com/${skillSource.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline break-all"
                      >
                        github.com/{skillSource.repo}
                      </a>
                    </div>
                    {skillSource.path && (
                      <div>
                        <span className="text-muted-foreground">path</span>{" "}
                        <span className="text-foreground">{skillSource.path}</span>
                      </div>
                    )}
                    {skillSource.ref && skillSource.ref !== "main" && (
                      <div>
                        <span className="text-muted-foreground">ref</span>{" "}
                        <span className="text-foreground">{skillSource.ref}</span>
                      </div>
                    )}
                  </>
                )}
                {isNpmSource(skillSource) && (
                  <div>
                    <span className="text-muted-foreground">npm</span>{" "}
                    <span className="text-foreground">
                      {skillSource.package}
                      {skillSource.version && skillSource.version !== "latest"
                        ? `@${skillSource.version}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rule Content */}
          {ruleData && item.type === "rule" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Rule Content
              </h3>
              <div className="border border-border/50 bg-background/30 p-4">
                <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                  {ruleData.content}
                </pre>
              </div>
            </div>
          )}

          {/* Freshness + ID */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border/30 pt-4">
            {item.trust?.lastSyncedAt && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Synced {new Date(item.trust.lastSyncedAt).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <ExternalLink className="h-3 w-3" />
              {item.id}
            </span>
          </div>
        </div>
      </dialog>
    </div>
  );
}
