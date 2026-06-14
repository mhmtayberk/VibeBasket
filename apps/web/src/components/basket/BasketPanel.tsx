"use client";

import type { EnabledAuthProvider } from "@/auth.config";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { SaveStackDialog } from "@/components/stacks/SaveStackDialog";
import { SavedStacksPanel } from "@/components/stacks/SavedStacksPanel";
import { TARGET_OPTIONS, isSupportedTargetId } from "@/lib/targets";
import { cn } from "@/lib/utils";
import { useBasketStore } from "@/store/basketStore";
import { CheckCircle2, ChevronsDown, ChevronsUp, Copy, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BasketPanelProps {
  className?: string;
  variant?: "desktop" | "modal";
  onClose?: () => void;
  isSignedIn?: boolean;
  enabledProviders?: EnabledAuthProvider[];
  userRole?: string;
}

export function BasketPanel({
  className,
  variant = "desktop",
  onClose,
  isSignedIn = false,
  enabledProviders = [],
  userRole,
}: BasketPanelProps) {
  const items = useBasketStore((s) => s.items);
  const targets = useBasketStore((s) => s.targetIds);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const removeItem = useBasketStore((s) => s.removeItem);
  const toggleTargetId = useBasketStore((s) => s.toggleTargetId);
  const [isBuilding, setIsBuilding] = useState(false);
  const [bundleCommand, setBundleCommand] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [savedStacksVersion, setSavedStacksVersion] = useState(0);

  const visibleItems = showAllItems ? items : items.slice(0, 6);
  const supportedTargets = TARGET_OPTIONS.filter((target) => target.status === "supported");
  const roadmapTargets = TARGET_OPTIONS.filter((target) => target.status === "coming-soon");
  const itemCounts = items.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const hasSkills = Boolean(itemCounts.skill);
  const hasRules = Boolean(itemCounts.rule);
  const incompatibleTargets = supportedTargets.filter((t) => {
    if (hasSkills && !t.capabilities.supportsSkills) return true;
    if (hasRules && !t.capabilities.supportsRules) return true;
    return false;
  });

  const handleBuild = async () => {
    if (items.length === 0 || targets.length === 0) {
      toast.error("Pick at least one item and one target IDE.");
      return;
    }

    setIsBuilding(true);
    try {
      const response = await fetch("/api/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targets,
          scope: "user",
          itemIds: items.map((item) => item.id),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to build bundle");
      }

      const data = await response.json();
      const command = `npx vibebasket apply ${data.url}`;
      setBundleCommand(command);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      }
      toast.success("Install command copied to clipboard.");
    } catch {
      toast.error("Failed to generate bundle command.");
    } finally {
      setIsBuilding(false);
    }
  };

  const toggleTarget = (targetId: string) => {
    if (!isSupportedTargetId(targetId)) {
      toast.message("This target is planned, but not supported by the apply engine yet.");
      return;
    }

    toggleTargetId(targetId);
  };

  return (
    <aside
      className={cn(
        "border border-border/80 bg-card/85 backdrop-blur-sm lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto custom-scrollbar",
        variant === "desktop" ? "sticky top-24 rounded-lg" : "rounded-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Your Basket
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Ready to bundle</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex min-w-10 justify-center border border-border/70 bg-background/50 px-2 py-1 font-mono text-[11px] text-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
          {variant === "modal" && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center border border-border/70 text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground"
              aria-label="Close basket"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              Select MCPs, skills, and rules from the builder to assemble your setup.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(["mcp", "skill", "rule", "workflow"] as const).map((type) =>
                  itemCounts[type] ? (
                    <div
                      key={type}
                      className="inline-flex items-center gap-2 border border-border/70 bg-background/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      <span className="text-accent">{itemCounts[type]}</span>
                      <span>{type === "workflow" ? "workflow packs" : `${type}s`}</span>
                    </div>
                  ) : null,
                )}
              </div>

              <div
                className={cn(
                  "space-y-0",
                  items.length > 6 && showAllItems ? "max-h-80 overflow-y-auto pr-1" : "",
                )}
              >
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-border/60 py-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <p className="mt-1 pl-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {item.type}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {items.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowAllItems((current) => !current)}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:text-foreground"
            >
              {showAllItems ? (
                <ChevronsUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronsDown className="h-3.5 w-3.5" />
              )}
              {showAllItems ? "Collapse list" : `Show ${items.length - 6} more`}
            </button>
          ) : null}
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Target IDEs
            </p>
            <button
              type="button"
              onClick={() => {
                clearBasket();
                setBundleCommand(null);
                toast.success("Basket cleared.");
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  Works today
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {supportedTargets.length} targets
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {supportedTargets.map((target) => {
                  const active = targets.includes(target.id);
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => toggleTarget(target.id)}
                      className={cn(
                        "min-h-14 border px-3 py-2 text-left transition-colors",
                        active
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border/70 bg-background/40 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{target.label}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground/85">
                        {target.vendor}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {roadmapTargets.length > 0 ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Ecosystem watchlist
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                    {roadmapTargets.length} soon
                  </span>
                </div>

                <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {roadmapTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => toggleTarget(target.id)}
                      aria-disabled
                      className="min-h-14 border border-border/50 bg-background/25 px-3 py-2 text-left text-muted-foreground/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{target.label}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground/85">
                        {target.vendor}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {incompatibleTargets.length > 0 && (
            <p className="text-xs leading-6 text-amber-300/90">
              {incompatibleTargets.map((t) => t.label).join(", ")}: doesn&apos;t support{" "}
              {[hasSkills ? "Skills" : "", hasRules ? "Rules" : ""].filter(Boolean).join(" or ")}.
              These will be skipped during apply.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          {userRole !== "admin" && (
            <div className="flex flex-wrap items-center gap-3">
              {isSignedIn ? (
                <SaveStackDialog
                  disabled={items.length === 0 || targets.length === 0}
                  items={items}
                  targetIds={targets}
                  onSaved={() => setSavedStacksVersion((current) => current + 1)}
                />
              ) : enabledProviders.length > 0 ? (
                <SignInDialog providers={enabledProviders} callbackUrl="/stacks" />
              ) : null}
              {!isSignedIn ? (
                <p className="text-xs leading-6 text-muted-foreground">
                  Sign in to save reusable stacks to your profile.
                </p>
              ) : null}
            </div>
          )}

          <SavedStacksPanel
            enabled={isSignedIn}
            refreshToken={savedStacksVersion}
            userRole={userRole}
          />
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Bundle Preview
          </p>
          <div className="border border-border/70 bg-background/60 p-4 font-mono text-[11px] leading-6 text-muted-foreground space-y-1">
            {items.length === 0 ? (
              <p>Select items to preview your bundle.</p>
            ) : (
              <>
                <p>
                  {items.length} item{items.length !== 1 ? "s" : ""}:{" "}
                  {(["mcp", "skill", "rule"] as const)
                    .filter((t) => itemCounts[t])
                    .map((t) => `${itemCounts[t]} ${t}${itemCounts[t] !== 1 ? "s" : ""}`)
                    .join(", ")}
                </p>
                <p>
                  → {targets.length} target{targets.length !== 1 ? "s" : ""}
                </p>
                {incompatibleTargets.length > 0 && (
                  <p className="text-amber-300/90">
                    → {incompatibleTargets.map((t) => t.label).join(", ")}: skills/rules skipped
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Install Command
          </p>
          <div className="border border-border/70 bg-background/60 p-4 font-mono text-[12px] leading-6 text-muted-foreground">
            {bundleCommand ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-accent">{bundleCommand}</span>
                  <Copy className="h-4 w-4 shrink-0 text-foreground" />
                </div>
                <div className="space-y-1 text-[11px]">
                  <p>&gt; Fetching basket configuration...</p>
                  <p>&gt; Resolving trusted MCP components...</p>
                  <p className="text-accent">&gt; Ready to apply across your selected IDEs.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-[11px]">
                <p className="text-accent">$ npx vibebasket apply &lt;bundle-url&gt;</p>
                <p>&gt; Your generated command will appear here.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBuild}
            disabled={isBuilding || items.length === 0 || targets.length === 0}
            className="inline-flex h-12 w-full items-center justify-center gap-2 border border-accent bg-accent px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBuilding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isBuilding
              ? "Generating"
              : bundleCommand
                ? "Copy Fresh Command"
                : "Generate Install Command"}
          </button>
        </div>
      </div>
    </aside>
  );
}
