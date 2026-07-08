"use client";

import type { AppLocale } from "@/i18n/config";
import dynamic from "next/dynamic";

const BackupSection = dynamic(() => import("./BackupSection").then((mod) => mod.BackupSection), {
  ssr: false,
  loading: () => (
    <div className="border border-border/80 bg-card/70 p-6 text-sm text-muted-foreground">
      Loading backup and storage controls...
    </div>
  ),
});

export function BackupSectionLazy({ locale }: { locale: AppLocale }) {
  return <BackupSection locale={locale} />;
}
