"use client";

import type { AppDictionary } from "@/i18n/dictionaries/en";
import type { BasketItem } from "@/store/basketStore";
import { isAllowedRemoteMcpUrl } from "@vibebasket/core/manifest";
import { ExternalLink, Globe, X } from "lucide-react";

interface CatalogDetailProps {
  item: BasketItem;
  open: boolean;
  onClose: () => void;
  copy: AppDictionary["catalogUi"];
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
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

export function CatalogDetail({ item, open, onClose, copy }: CatalogDetailProps) {
  if (!open) return null;

  const mcpData = item.mcpData;
  const safeRemoteUrl = mcpData?.url && isAllowedRemoteMcpUrl(mcpData.url) ? mcpData.url : null;
  const ruleData = item.ruleData;
  const skillData = item.skillData;
  const skillSource = skillData?.source;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={copy.detail.close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <dialog
        open
        className="relative z-10 max-h-[85vh] w-full overflow-y-auto border-t border-border/80 bg-card px-0 pb-0 shadow-[0_0_60px_rgba(0,0,0,0.9)] sm:max-w-lg sm:rounded-[2px] sm:border"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border/70 bg-card px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  item.type === "mcp"
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-accent/30 bg-accent/10 text-accent"
                }`}
              >
                {item.type}
              </span>
              {item.trust && (
                <span
                  className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
                    item.trust.tier === "verified"
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : item.trust.tier === "official"
                        ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
                        : "border-border/50 bg-background/30 text-muted-foreground"
                  }`}
                >
                  {copy.trust.tiers[item.trust.tier]}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {item.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}

          {item.trust && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>
                {copy.trust.sources[item.trust.sourceKey]} · {copy.trust.details[item.trust.tier]}
              </span>
            </div>
          )}

          {mcpData && item.type === "mcp" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.detail.installCommand}
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
                    <span className="text-muted-foreground">{copy.detail.url}:</span>{" "}
                    <a
                      href={safeRemoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-accent hover:underline"
                    >
                      {safeRemoteUrl}
                    </a>
                  </div>
                )}
                {mcpData.env && Object.keys(mcpData.env).length > 0 && (
                  <div className="mt-2 border-t border-border/30 pt-2">
                    <span className="text-muted-foreground">{copy.detail.env}:</span>
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
                <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                  {formatTemplate(copy.detail.requiresSecrets, {
                    secrets: mcpData.requiredSecrets.join(", "),
                  })}
                </p>
              ) : null}
            </div>
          )}

          {skillSource && item.type === "skill" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.detail.source}
              </h3>
              <div className="space-y-1.5 border border-border/50 bg-background/30 p-4 font-mono text-[11px]">
                {isGithubSource(skillSource) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">repo</span>{" "}
                      <a
                        href={`https://github.com/${skillSource.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-accent hover:underline"
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

          {ruleData && item.type === "rule" && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.detail.ruleContent}
              </h3>
              <div className="border border-border/50 bg-background/30 p-4">
                <pre className="custom-scrollbar max-h-64 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground">
                  {ruleData.content}
                </pre>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/30 pt-4 text-xs text-muted-foreground">
            {item.trust?.lastSyncedAt && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {formatTemplate(copy.detail.synced, {
                  date: new Date(item.trust.lastSyncedAt).toLocaleDateString(),
                })}
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
