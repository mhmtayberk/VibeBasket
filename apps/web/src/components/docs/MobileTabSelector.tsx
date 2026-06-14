"use client";

import { useRouter } from "next/navigation";

const ALLOWED_TABS = [
  "hub",
  "getting-started",
  "cli",
  "adapters",
  "delimiters",
  "security",
  "self-hosting",
] as const;

const TAB_LABELS: Record<string, string> = {
  hub: "Documentation Hub",
  "getting-started": "Getting Started",
  cli: "CLI Reference",
  adapters: "IDE Adapters",
  delimiters: "Block Delimiters",
  security: "Secret Security",
  "self-hosting": "Self-Hosting Guide",
};

interface MobileTabSelectorProps {
  activeTab: string;
}

export function MobileTabSelector({ activeTab }: MobileTabSelectorProps) {
  const router = useRouter();

  return (
    <div className="lg:hidden w-full px-4 pt-4 pb-2 border-b border-border/70 bg-background sticky top-[73px] z-40">
      <select
        value={activeTab}
        onChange={(e) => {
          router.push(`/docs?tab=${e.target.value}`);
        }}
        className="w-full h-10 border border-border/70 bg-card/60 px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground focus:border-accent focus:outline-none"
        aria-label="Documentation section"
      >
        {ALLOWED_TABS.map((tab) => (
          <option key={tab} value={tab}>
            {TAB_LABELS[tab]}
          </option>
        ))}
      </select>
    </div>
  );
}
