"use client";

import type { AppLocale } from "@/i18n/config";
import { useEffect, useState } from "react";

type HealthTone = "healthy" | "warning" | "critical";

interface ReleaseReadinessItem {
  key: string;
  label: string;
  tone: HealthTone;
  detail: string;
}

interface ReleaseReadinessReport {
  tone: HealthTone;
  blockers: ReleaseReadinessItem[];
  warnings: ReleaseReadinessItem[];
  checks: ReleaseReadinessItem[];
}

const toneClasses: Record<HealthTone, string> = {
  healthy: "border-accent/30 bg-accent/10 text-accent",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
};

const COPY = {
  en: {
    eyebrow: "Release Readiness",
    title: "Prod blockers and deploy-time warnings",
    description:
      "This is a lightweight preflight view over auth, backup, storage, and catalog refresh configuration so broken deploys are visible before launch day.",
    loading: "loading",
    loadError: "Failed to load release readiness.",
    blockers: "Blockers",
    warnings: "Warnings",
    passingChecks: "Passing Checks",
    noBlockers: "No immediate prod blockers detected from the current runtime configuration.",
    blocker: "Blocker",
    warning: "Warning",
    currentRuntime: "Current runtime",
    loadingBody: "Loading release readiness...",
  },
  tr: {
    eyebrow: "Release Readiness",
    title: "Prod blocker'ları ve deploy sırasında görülen uyarılar",
    description:
      "Bu bölüm auth, backup, storage ve catalog refresh yapılandırması üzerinde hafif bir preflight görünümü sunar; böylece bozuk deploy'lar launch öncesinde görünür olur.",
    loading: "yükleniyor",
    loadError: "Release readiness yüklenemedi.",
    blockers: "Blocker'lar",
    warnings: "Uyarılar",
    passingChecks: "Geçen kontroller",
    noBlockers: "Geçerli runtime yapılandırmasında anlık prod blocker tespit edilmedi.",
    blocker: "Blocker",
    warning: "Uyarı",
    currentRuntime: "Mevcut runtime",
    loadingBody: "Release readiness yükleniyor...",
  },
  es: {
    eyebrow: "Release Readiness",
    title: "Bloqueos de prod y advertencias de despliegue",
    description:
      "Esta es una vista ligera de preflight sobre auth, backup, storage y catalog refresh para que los despliegues rotos sean visibles antes del launch.",
    loading: "cargando",
    loadError: "No se pudo cargar release readiness.",
    blockers: "Bloqueos",
    warnings: "Advertencias",
    passingChecks: "Checks correctos",
    noBlockers:
      "No se detectaron bloqueos inmediatos de prod en la configuración actual del runtime.",
    blocker: "Bloqueo",
    warning: "Advertencia",
    currentRuntime: "Runtime actual",
    loadingBody: "Cargando release readiness...",
  },
  zh: {
    eyebrow: "发布准备",
    title: "生产阻塞项与部署期告警",
    description:
      "这是一个针对认证、备份、存储和目录刷新配置的轻量预检视图，让损坏的部署在正式上线前就暴露出来。",
    loading: "加载中",
    loadError: "无法加载发布准备状态。",
    blockers: "阻塞项",
    warnings: "告警",
    passingChecks: "通过的检查",
    noBlockers: "当前运行时配置下未发现立即影响生产的阻塞项。",
    blocker: "阻塞",
    warning: "告警",
    currentRuntime: "当前运行时",
    loadingBody: "正在加载发布准备状态...",
  },
  hi: {
    eyebrow: "रिलीज़ तैयारी",
    title: "Prod blockers और तैनाती समय चेतावनियाँ",
    description:
      "यह auth, backup, storage और catalog refresh कॉन्फ़िगरेशन का एक हल्का preflight view है, ताकि launch से पहले खराब deploy दिख जाए।",
    loading: "लोड हो रहा है",
    loadError: "Release readiness लोड नहीं हो सका।",
    blockers: "ब्लॉकर",
    warnings: "चेतावनी",
    passingChecks: "सफल जांचें",
    noBlockers: "मौजूदा runtime configuration में कोई तत्काल prod blocker नहीं मिला।",
    blocker: "ब्लॉकर",
    warning: "चेतावनी",
    currentRuntime: "मौजूदा रनटाइम",
    loadingBody: "Release readiness लोड हो रहा है...",
  },
  ru: {
    eyebrow: "Готовность к релизу",
    title: "Prod-блокеры и предупреждения времени деплоя",
    description:
      "Это лёгкий preflight-взгляд на auth, backup, storage и catalog refresh configuration, чтобы проблемные deploy’и были заметны до launch day.",
    loading: "загрузка",
    loadError: "Не удалось загрузить статус готовности к релизу.",
    blockers: "Блокеры",
    warnings: "Предупреждения",
    passingChecks: "Успешные проверки",
    noBlockers: "В текущей runtime-конфигурации не обнаружено немедленных prod-блокеров.",
    blocker: "Блокер",
    warning: "Предупреждение",
    currentRuntime: "Текущий runtime",
    loadingBody: "Загрузка статуса готовности к релизу...",
  },
} as const;

export function ReleaseReadinessPanel({ locale }: { locale: AppLocale }) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const [report, setReport] = useState<ReleaseReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/release-readiness", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { success: boolean; report?: ReleaseReadinessReport; error?: string }) => {
        if (result.success && result.report) {
          setReport(result.report);
          setError(null);
          return;
        }

        setError(result.error ?? copy.loadError);
      })
      .catch(() => {
        setError(copy.loadError);
      });
  }, [copy.loadError]);

  return (
    <section className="mb-8 border border-border/80 bg-card/70 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {copy.eyebrow}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <span
          className={`inline-flex h-fit items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
            report
              ? toneClasses[report.tone]
              : "border-border/70 bg-background/50 text-muted-foreground"
          }`}
        >
          {report ? report.tone : copy.loading}
        </span>
      </div>

      {error ? (
        <div className="mt-6 border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
          {error}
        </div>
      ) : null}

      {report ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.blockers}
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {report.blockers.length}
              </div>
            </div>
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.warnings}
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {report.warnings.length}
              </div>
            </div>
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.passingChecks}
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">{report.checks.length}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-3">
              {report.blockers.length === 0 && report.warnings.length === 0 ? (
                <div className="border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
                  {copy.noBlockers}
                </div>
              ) : null}

              {report.blockers.map((item) => (
                <div key={item.key} className="border border-destructive/30 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
                      {copy.blocker}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}

              {report.warnings.map((item) => (
                <div key={item.key} className="border border-amber-400/30 bg-amber-400/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
                      {copy.warning}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-border/70 bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                  {copy.passingChecks}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {copy.currentRuntime}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {report.checks.map((item) => (
                  <div key={item.key} className="border border-border/70 bg-card/70 p-3">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
          {copy.loadingBody}
        </div>
      )}
    </section>
  );
}
