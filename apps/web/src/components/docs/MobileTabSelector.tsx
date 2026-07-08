"use client";

import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
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

interface MobileTabSelectorProps {
  activeTab: string;
  locale: AppLocale;
  tabLabels: Record<string, string>;
  ariaLabel: string;
}

export function MobileTabSelector({
  activeTab,
  locale,
  tabLabels,
  ariaLabel,
}: MobileTabSelectorProps) {
  const router = useRouter();

  return (
    <div className="lg:hidden w-full px-4 pt-4 pb-2 border-b border-border/70 bg-background sticky top-[73px] z-40">
      <select
        value={activeTab}
        onChange={(e) => {
          router.push(`${localizePath(locale, "/docs")}?tab=${e.target.value}`);
        }}
        className="w-full h-10 border border-border/70 bg-card/60 px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground focus:border-accent focus:outline-none"
        aria-label={ariaLabel}
      >
        {ALLOWED_TABS.map((tab) => (
          <option key={tab} value={tab}>
            {tabLabels[tab]}
          </option>
        ))}
      </select>
    </div>
  );
}
