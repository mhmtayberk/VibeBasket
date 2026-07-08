"use client";

import type { AppLocale } from "@/i18n/config";
import { useState, useTransition } from "react";
import { triggerSyncAction } from "./sync-actions";

const COPY = {
  en: {
    syncing: "Syncing Registry...",
    trigger: "Trigger Manual Sync",
    syncingFailed: "Failed to complete registry synchronization.",
    networkError: "Network error — the sync service may be unavailable.",
    synced: (items: number, mcps: number, skills: number, duration: number) =>
      `Synced ${items} items (${mcps} MCPs, ${skills} Skills) in ${duration.toFixed(2)}s.`,
    okPrefix: "[OK]",
    errPrefix: "[ERR]",
  },
  tr: {
    syncing: "Registry senkronu başlatılıyor...",
    trigger: "Manuel Senkronu Başlat",
    syncingFailed: "Katalog senkronizasyonu tamamlanamadı.",
    networkError: "Ağ hatası — senkron servisi şu an ulaşılamıyor olabilir.",
    synced: (items: number, mcps: number, skills: number, duration: number) =>
      `${items} öğe senkronlandı (${mcps} MCP, ${skills} Skill) ${duration.toFixed(2)}s.`,
    okPrefix: "[TAMAM]",
    errPrefix: "[HATA]",
  },
  es: {
    syncing: "Sincronizando registro...",
    trigger: "Ejecutar sincronización manual",
    syncingFailed: "No se pudo completar la sincronización del catálogo.",
    networkError: "Error de red: puede que el servicio de sincronización no esté disponible.",
    synced: (items: number, mcps: number, skills: number, duration: number) =>
      `Sincronizados ${items} elementos (${mcps} MCPs, ${skills} Skills) en ${duration.toFixed(2)}s.`,
    okPrefix: "[OK]",
    errPrefix: "[ERR]",
  },
  zh: {
    syncing: "正在同步注册表…",
    trigger: "触发手动同步",
    syncingFailed: "无法完成目录同步。",
    networkError: "网络错误 — 同步服务可能暂时不可用。",
    synced: (items: number, mcps: number, skills: number, duration: number) =>
      `已同步 ${items} 项（${mcps} 个 MCP，${skills} 个 Skill）用时 ${duration.toFixed(2)} 秒。`,
    okPrefix: "[完成]",
    errPrefix: "[错误]",
  },
  hi: {
    syncing: "रजिस्ट्री सिंक हो रही है...",
    trigger: "मैनुअल सिंक चलाएं",
    syncingFailed: "कैटलॉग सिंक पूरा नहीं हुआ।",
    networkError: "नेटवर्क त्रुटि — सिंक सेवा उपलब्ध नहीं हो सकती।",
    synced: (items: number, mcps: number, skills: number, duration: number) =>
      `${items} आइटम सिंक हो गए (${mcps} MCP, ${skills} Skills) ${duration.toFixed(2)}s में।`,
    okPrefix: "[ठीक]",
    errPrefix: "[त्रुटि]",
  },
} as const;

const copyForLocale = (locale: AppLocale) => COPY[locale];

export function SyncButton({ locale }: { locale: AppLocale }) {
  const copy = copyForLocale(locale);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = () => {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await triggerSyncAction();
        if (response.success && response.summary) {
          setResult({
            success: true,
            message: copy.synced(
              response.summary.totalItems,
              response.summary.mcps,
              response.summary.skills,
              response.summary.durationMs / 1000,
            ),
          });
        } else {
          setResult({
            success: false,
            message: response.error || copy.syncingFailed,
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : copy.networkError;
        setResult({ success: false, message });
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 border font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
          isPending
            ? "border-border/50 bg-background/30 text-muted-foreground cursor-not-allowed"
            : "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
        }`}
      >
        {isPending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {copy.syncing}
          </>
        ) : (
          copy.trigger
        )}
      </button>

      {result && (
        <div
          className={`border p-3 font-mono text-[11px] leading-relaxed ${
            result.success
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span className="font-bold">{result.success ? copy.okPrefix : copy.errPrefix}</span>{" "}
          {result.message}
        </div>
      )}
    </div>
  );
}
