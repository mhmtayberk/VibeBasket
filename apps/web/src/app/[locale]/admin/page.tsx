import { type AppLocale, isSupportedLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/locale-routing";
import { buildLocaleMetadata } from "@/i18n/metadata";
import { shouldRenderAdminForbidden } from "@/lib/admin-access";
import {
  type HealthTone,
  buildAdminSourceHealth,
  classifyCatalogFreshness,
  computeFailureStreak,
} from "@/lib/admin-ops";
import { requireAdminRole } from "@/lib/admin-session";
import {
  catalogItems,
  catalogSyncRuns,
  db,
  savedStackItems,
  savedStacks,
  users,
} from "@vibebasket/core";
import { desc, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { AdminSectionNav } from "../../admin/AdminSectionNav";
import { BackupSectionLazy } from "../../admin/BackupSectionLazy";
import { ReleaseReadinessPanel } from "../../admin/ReleaseReadinessPanel";
import { SyncButton } from "../../admin/SyncButton";
import { SystemHealthPanel } from "../../admin/SystemHealthPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);

  return buildLocaleMetadata({
    locale,
    pathname: "/admin",
    title: `${dictionary.admin.title} | VibeBasket`,
    description: dictionary.admin.description,
    noIndex: true,
  });
}

export default async function LocalizedAdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  try {
    await requireAdminRole();
  } catch (error) {
    if (shouldRenderAdminForbidden(error)) {
      forbidden();
    }
  }

  const dictionary = await getDictionary(locale);
  const ADMIN_SECTIONS = [
    { id: "overview", label: dictionary.admin.sections.overview },
    { id: "release-readiness", label: dictionary.admin.sections.readiness },
    { id: "catalog-operations", label: dictionary.admin.sections.catalogOps },
    { id: "catalog-composition", label: dictionary.admin.sections.catalogData },
    { id: "collector-health", label: dictionary.admin.sections.collectors },
    { id: "recent-sync-runs", label: dictionary.admin.sections.syncRuns },
    { id: "backups", label: dictionary.admin.sections.backups },
    { id: "storage", label: dictionary.admin.sections.storage },
    { id: "schedules", label: dictionary.admin.sections.schedules },
    { id: "system-health", label: dictionary.admin.sections.systemHealth },
    { id: "user-overview", label: dictionary.admin.sections.users },
  ] as const;

  const [
    userCountResult,
    stackCountResult,
    popularItems,
    lastSyncResult,
    catalogCounts,
    recentSyncRuns,
    sourceCounts,
    latestCatalogFreshness,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(users),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(savedStacks),
    db
      .select({
        catalogItemId: savedStackItems.catalogItemId,
        displayName: savedStackItems.snapshotDisplayName,
        type: savedStackItems.catalogItemType,
        count: sql<number>`count(${savedStackItems.catalogItemId})`.mapWith(Number),
      })
      .from(savedStackItems)
      .groupBy(
        savedStackItems.catalogItemId,
        savedStackItems.snapshotDisplayName,
        savedStackItems.catalogItemType,
      )
      .orderBy(desc(sql`count(${savedStackItems.catalogItemId})`))
      .limit(5),
    db.select().from(catalogSyncRuns).orderBy(desc(catalogSyncRuns.completedAt)).limit(1),
    db
      .select({
        type: catalogItems.type,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(catalogItems)
      .groupBy(catalogItems.type),
    db.select().from(catalogSyncRuns).orderBy(desc(catalogSyncRuns.completedAt)).limit(6),
    db
      .select({
        sourceName: catalogItems.sourceName,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(catalogItems)
      .groupBy(catalogItems.sourceName),
    db
      .select({
        lastSyncedAt: catalogItems.lastSyncedAt,
      })
      .from(catalogItems)
      .orderBy(desc(catalogItems.lastSyncedAt))
      .limit(1),
  ]);

  const totalUsers = userCountResult[0]?.count || 0;
  const totalStacks = stackCountResult[0]?.count || 0;
  const lastSync = lastSyncResult[0] || null;
  const normalizedRecentSyncRuns = recentSyncRuns.map((run) => ({
    ...run,
    sourceErrors: Array.isArray(run.sourceErrors)
      ? (run.sourceErrors as Array<{ source: string; error: string }>)
      : [],
  }));

  const catalogStats = {
    mcp: 0,
    skill: 0,
    rule: 0,
    workflow: 0,
  };
  for (const item of catalogCounts) {
    if (item.type in catalogStats) {
      catalogStats[item.type as keyof typeof catalogStats] = item.count;
    }
  }

  const freshness = classifyCatalogFreshness(
    latestCatalogFreshness[0]?.lastSyncedAt ?? lastSync?.completedAt ?? null,
  );
  const failureStreak = computeFailureStreak(normalizedRecentSyncRuns);
  const sourceHealth = buildAdminSourceHealth(normalizedRecentSyncRuns, sourceCounts);

  const toneClasses: Record<HealthTone, string> = {
    healthy: "border-accent/30 bg-accent/10 text-accent",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    critical: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  const copy = {
    activeBase: {
      en: "Active Base",
      tr: "Aktif taban",
      es: "Base activa",
      zh: "活跃基数",
      hi: "सक्रिय आधार",
    },
    registeredUsers: {
      en: "Registered users utilizing stacks",
      tr: "Stack kullanan kayıtlı kullanıcılar",
      es: "Usuarios registrados que usan stacks",
      zh: "正在使用 Stack 的已注册用户",
      hi: "Stack का उपयोग करने वाले पंजीकृत उपयोगकर्ता",
    },
    savedEcosystems: {
      en: "Saved Ecosystems",
      tr: "Kaydedilmiş ekosistemler",
      es: "Ecosistemas guardados",
      zh: "已保存的生态配置",
      hi: "सहेजे गए इकोसिस्टम",
    },
    namedBundles: {
      en: "Named bundles successfully configured",
      tr: "Başarıyla yapılandırılmış isimli bundle’lar",
      es: "Bundles con nombre configurados correctamente",
      zh: "已成功配置的命名 bundle",
      hi: "सफलतापूर्वक कॉन्फ़िगर किए गए नामित bundles",
    },
    registrySync: {
      en: "Registry Sync",
      tr: "Registry senkronu",
      es: "Sync del registry",
      zh: "注册表同步",
      hi: "रजिस्ट्री सिंक",
    },
    success: {
      en: "Success",
      tr: "Başarılı",
      es: "Correcto",
      zh: "成功",
      hi: "सफल",
    },
    failed: {
      en: "Failed",
      tr: "Başarısız",
      es: "Fallido",
      zh: "失败",
      hi: "विफल",
    },
    lastSynced: {
      en: "Last Synced",
      tr: "Son senkron",
      es: "Último sync",
      zh: "上次同步",
      hi: "पिछला सिंक",
    },
    never: {
      en: "Never",
      tr: "Hiç",
      es: "Nunca",
      zh: "从未",
      hi: "कभी नहीं",
    },
    stable: {
      en: "Stable",
      tr: "Stabil",
      es: "Estable",
      zh: "稳定",
      hi: "स्थिर",
    },
    durationLabel: {
      en: "Duration",
      tr: "Süre",
      es: "Duración",
      zh: "持续时长",
      hi: "अवधि",
    },
    noDuration: {
      en: "0s",
      tr: "0 sn",
      es: "0s",
      zh: "0 秒",
      hi: "0 सेकंड",
    },
    ingestedMcps: {
      en: "Ingested MCPs",
      tr: "Alınan MCP'ler",
      es: "MCP ingeridos",
      zh: "已摄入 MCP",
      hi: "इनजेस्ट किए गए MCP",
    },
    ingestedSkills: {
      en: "Ingested Skills",
      tr: "Alınan Skill'ler",
      es: "Skills ingeridas",
      zh: "已摄入 Skill",
      hi: "इनजेस्ट किए गए Skills",
    },
    catalogFreshnessTitle: {
      en: "Catalog Freshness",
      tr: "Katalog tazeliği",
      es: "Actualización del catálogo",
      zh: "目录新鲜度",
      hi: "कैटलॉग ताजगी",
    },
    catalogFreshnessDescription: {
      en: "Age of the freshest synced catalog row.",
      tr: "En yeni senkronize katalog satırının yaşı.",
      es: "Tiempo desde la entrada más reciente sincronizada del catálogo.",
      zh: "最新同步目录条目的时间间隔。",
      hi: "नवीनतम सिंक किए गए कैटलॉग आइटम की उम्र।",
    },
    syncResilienceTitle: {
      en: "Sync Resilience",
      tr: "Senkron dayanıklılığı",
      es: "Resistencia de sincronización",
      zh: "同步韧性",
      hi: "सिंक्रोनाइज़ेशन स्थिरता",
    },
    syncResilienceDescription: {
      en: "Consecutive failed sync runs from the latest attempt backward.",
      tr: "En son girişimden geriye doğru ardışık başarısız senkron çalıştırmaları.",
      es: "Ejecuciones de sincronización fallidas consecutivas desde el último intento.",
      zh: "从最近一次尝试起向后追溯的连续失败同步次数。",
      hi: "नवीनतम प्रयास से पीछे क्रमिक विफल सिंक रन।",
    },
    sourceCoverageTitle: {
      en: "Source Coverage",
      tr: "Kaynak kapsamı",
      es: "Cobertura de fuentes",
      zh: "来源覆盖",
      hi: "स्रोत कवरेज",
    },
    sourceCoverageBadge: {
      en: "3 collectors",
      tr: "3 kolektör",
      es: "3 recolectores",
      zh: "3 个采集器",
      hi: "3 संग्रहकर्ता",
    },
    sourceCoverageDescription: {
      en: "Rows currently attributed to built-in sync collectors.",
      tr: "Satırlar şu anda yerleşik senkron kolektörlerine atanmış durumda.",
      es: "Filas actualmente asociadas a recolectores de sincronización integrados.",
      zh: "当前归属于内置同步采集器的记录。",
      hi: "वर्तमान में पंक्तियाँ अंतर्निहित सिंक कलेक्टरों को आवंटित हैं।",
    },
    popularIntegrations: {
      en: "Popular Integrations",
      tr: "Popüler entegrasyonlar",
      es: "Integraciones populares",
      zh: "热门集成",
      hi: "लोकप्रिय एकीकरण",
    },
    topSelectionLabel: {
      en: "Top 5 selections",
      tr: "İlk 5 seçim",
      es: "Top 5 selecciones",
      zh: "前 5 个",
      hi: "शीर्ष 5 चयन",
    },
    noStacksYet: {
      en: "No stack items saved yet. Popularity calculations will appear once users save bundles.",
      tr: "Henüz kayıtlı stack öğesi yok. Kullanıcılar bundle kaydettiğinde popülerlik görünecek.",
      es: "Aún no hay elementos de stack guardados. Se mostrarán los cálculos al guardar bundles.",
      zh: "尚未保存堆栈项目。用户保存 bundle 后将显示热门度统计。",
      hi: "अभी तक कोई stack आइटम सेव नहीं। उपयोगकर्ता bundle सेव करें तो लोकप्रियता दिखेगी।",
    },
    tableIndex: {
      en: "#",
      tr: "#",
      es: "#",
      zh: "#",
      hi: "#",
    },
    integrationLabel: {
      en: "Integration",
      tr: "Entegrasyon",
      es: "Integración",
      zh: "集成",
      hi: "इंटीग्रेशन",
    },
    typeLabel: {
      en: "Type",
      tr: "Tür",
      es: "Tipo",
      zh: "类型",
      hi: "प्रकार",
    },
    usageLabel: {
      en: "Usage",
      tr: "Kullanım",
      es: "Uso",
      zh: "使用量",
      hi: "उपयोग",
    },
    aggregatedLabel: {
      en: "Aggregated across all user-owned active configurations.",
      tr: "Tüm kullanıcıya ait aktif konfigürasyonlarda toplam.",
      es: "Agregado sobre todas las configuraciones activas de usuarios.",
      zh: "汇总至所有由用户拥有的活动配置。",
      hi: "सभी उपयोगकर्ता-नियंत्रित सक्रिय कॉन्फ़िगरेशन का कुल योग।",
    },
    catalogCompositionTitle: {
      en: "Central Catalog Registry Composition",
      tr: "Merkezi katalog kayıt kompozisyonu",
      es: "Composición del registro central del catálogo",
      zh: "中央目录注册表构成",
      hi: "केंद्रीय कैटलॉग रजिस्ट्री संरचना",
    },
    catalogCompositionTypeLabels: {
      mcp: {
        en: "MCP Servers",
        tr: "MCP Sunucuları",
        es: "Servidores MCP",
        zh: "MCP 服务器",
        hi: "MCP सर्वर",
      },
      skills: {
        en: "Skills",
        tr: "Skill'ler",
        es: "Skills",
        zh: "技能",
        hi: "Skills",
      },
      rules: {
        en: "Rules",
        tr: "Kurallar",
        es: "Reglas",
        zh: "规则",
        hi: "नियम",
      },
      workflows: {
        en: "Workflows",
        tr: "İş akışları",
        es: "Workflows",
        zh: "工作流",
        hi: "वर्कफ़्लो",
      },
    },
    collectorHealthTitle: {
      en: "Collector Health",
      tr: "Collector sağlığı",
      es: "Estado de recolectores",
      zh: "采集器状态",
      hi: "कलेक्टर स्वास्थ्य",
    },
    collectorHealthSubtitle: {
      en: "Lightweight source visibility",
      tr: "Hafif kaynak görünürlüğü",
      es: "Visibilidad ligera de fuente",
      zh: "轻量级来源可见性",
      hi: "हल्का स्रोत दृश्यमानता",
    },
    rowsLabel: {
      en: "Rows",
      tr: "Satırlar",
      es: "Filas",
      zh: "行数",
      hi: "पंक्तियाँ",
    },
    recentErrorsLabel: {
      en: "Recent Errors",
      tr: "Son hatalar",
      es: "Errores recientes",
      zh: "最近错误",
      hi: "हालिया त्रुटियाँ",
    },
    recentSyncRunsTitle: {
      en: "Recent Sync Runs",
      tr: "Son senkron çalışmaları",
      es: "Ejecuciones de sync recientes",
      zh: "最近同步运行",
      hi: "हालिया सिंक रन",
    },
    recentSyncRunsSubtitle: {
      en: "Last 6",
      tr: "Son 6",
      es: "Últimos 6",
      zh: "最近 6 次",
      hi: "पिछले 6",
    },
    runDurationLabel: {
      en: "Duration",
      tr: "Süre",
      es: "Duración",
      zh: "持续时间",
      hi: "अवधि",
    },
  } as const;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href={localizePath(locale, "/")}
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              VibeBasket
            </Link>
            <span className="inline-flex items-center border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              {dictionary.admin.badge}
            </span>
          </div>
          <Link
            href={localizePath(locale, "/")}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
          >
            {dictionary.admin.backToCatalog}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {dictionary.admin.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{dictionary.admin.description}</p>
        </div>

        <AdminSectionNav sections={[...ADMIN_SECTIONS]} ariaLabel={dictionary.admin.navAriaLabel} />

        <div id="release-readiness" className="scroll-mt-40">
          <ReleaseReadinessPanel locale={locale} />
        </div>

        <div id="overview" className="grid grid-cols-1 gap-6 md:grid-cols-3 scroll-mt-40">
          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.activeBase[locale]}
              </span>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">{totalUsers}</div>
            <p className="mt-1 text-xs text-muted-foreground">{copy.registeredUsers[locale]}</p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.savedEcosystems[locale]}
              </span>
              <span className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">{totalStacks}</div>
            <p className="mt-1 text-xs text-muted-foreground">{copy.namedBundles[locale]}</p>
          </div>

          <div
            id="catalog-operations"
            className="border border-border/80 bg-card/70 p-6 scroll-mt-40"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.registrySync[locale]}
              </span>
              <span
                className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${
                  lastSync?.success
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {lastSync?.success ? copy.success[locale] : copy.failed[locale]}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs leading-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{copy.lastSynced[locale]}</span>
                <span className="text-foreground">
                  {lastSync ? new Date(lastSync.completedAt).toLocaleString() : copy.never[locale]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{copy.durationLabel[locale]}</span>
                <span className="text-foreground">
                  {lastSync
                    ? `${(lastSync.durationMs / 1000).toFixed(2)}s`
                    : copy.noDuration[locale]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{copy.ingestedMcps[locale]}</span>
                <span className="text-foreground">{lastSync?.mcps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{copy.ingestedSkills[locale]}</span>
                <span className="text-foreground">{lastSync?.skills || 0}</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-border/70">
              <SyncButton locale={locale} />
            </div>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.catalogFreshnessTitle[locale]}
              </span>
              <span
                className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${toneClasses[freshness.tone]}`}
              >
                {freshness.label}
              </span>
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">
              {freshness.ageHours === null ? "—" : `${Math.round(freshness.ageHours)}h`}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.catalogFreshnessDescription[locale]}
            </p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.syncResilienceTitle[locale]}
              </span>
              <span
                className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  failureStreak === 0
                    ? toneClasses.healthy
                    : failureStreak < 3
                      ? toneClasses.warning
                      : toneClasses.critical
                }`}
              >
                {failureStreak === 0
                  ? copy.stable[locale]
                  : `${failureStreak} ${copy.failed[locale]}`}
              </span>
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">{failureStreak}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.syncResilienceDescription[locale]}
            </p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.sourceCoverageTitle[locale]}
              </span>
              <span className="inline-flex items-center border border-border/70 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.sourceCoverageBadge[locale]}
              </span>
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">
              {sourceHealth.reduce((sum, source) => sum + source.itemCount, 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.sourceCoverageDescription[locale]}
            </p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6 md:col-span-2 md:row-span-2">
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.popularIntegrations[locale]}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.topSelectionLabel[locale]}
              </span>
            </div>

            {popularItems.length === 0 ? (
              <div className="flex h-40 items-center justify-center border border-dashed border-border/70 text-xs text-muted-foreground">
                {copy.noStacksYet[locale]}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/70">
                      <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-12">
                        {copy.tableIndex[locale]}
                      </th>
                      <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {copy.integrationLabel[locale]}
                      </th>
                      <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {copy.typeLabel[locale]}
                      </th>
                      <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground text-right">
                        {copy.usageLabel[locale]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularItems.map((item, idx) => (
                      <tr
                        key={item.catalogItemId}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-sm font-medium text-foreground">
                            {item.displayName}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {item.catalogItemId}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex border border-border/70 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-sm font-semibold text-accent">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.aggregatedLabel[locale]}
            </p>
          </div>

          <div
            id="catalog-composition"
            className="border border-border/80 bg-card/70 p-6 md:col-span-3 scroll-mt-40"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.catalogCompositionTitle[locale]}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {catalogStats.mcp + catalogStats.skill + catalogStats.rule + catalogStats.workflow}{" "}
                items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                [copy.catalogCompositionTypeLabels.mcp[locale], catalogStats.mcp],
                [copy.catalogCompositionTypeLabels.skills[locale], catalogStats.skill],
                [copy.catalogCompositionTypeLabels.rules[locale], catalogStats.rule],
                [copy.catalogCompositionTypeLabels.workflows[locale], catalogStats.workflow],
              ].map(([label, count]) => (
                <div key={label} className="border border-border/70 bg-background/40 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-foreground">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            id="collector-health"
            className="border border-border/80 bg-card/70 p-6 md:col-span-2 scroll-mt-40"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.collectorHealthTitle[locale]}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.collectorHealthSubtitle[locale]}
              </span>
            </div>

            <div className="space-y-3">
              {sourceHealth.map((source) => (
                <div
                  key={source.key}
                  className="grid gap-3 border border-border/70 bg-background/40 p-4 md:grid-cols-[minmax(0,1.2fr)_auto_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{source.label}</span>
                      <span
                        className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${toneClasses[source.tone]}`}
                      >
                        {source.tone}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {source.description}
                      {source.lastError ? ` Last error: ${source.lastError}` : ""}
                    </p>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    <div>{copy.rowsLabel[locale]}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {source.itemCount}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    <div>{copy.recentErrorsLabel[locale]}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {source.recentFailureCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            id="recent-sync-runs"
            className="border border-border/80 bg-card/70 p-6 md:col-span-1 scroll-mt-40"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.recentSyncRunsTitle[locale]}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.recentSyncRunsSubtitle[locale]}
              </span>
            </div>

            <div className="space-y-3">
              {normalizedRecentSyncRuns.map((run) => (
                <div key={run.id} className="border border-border/70 bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {run.trigger}
                    </div>
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${run.success ? toneClasses.healthy : toneClasses.critical}`}
                    >
                      {run.success ? copy.success[locale] : copy.failed[locale]}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-xs text-foreground">
                    {new Date(run.completedAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {copy.runDurationLabel[locale]} {(run.durationMs / 1000).toFixed(2)}s
                  </div>
                  {run.sourceErrors.length > 0 ? (
                    <div className="mt-2 space-y-1 font-mono text-[10px] text-muted-foreground">
                      {run.sourceErrors.map((error, index) => (
                        <div key={`${run.id}-${error.source}-${index}`}>
                          <span className="text-foreground">{error.source}</span>: {error.error}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border/80 bg-card/70 p-6 md:col-span-3">
            <BackupSectionLazy locale={locale} />
          </div>
        </div>

        <SystemHealthPanel locale={locale} />
      </main>
    </div>
  );
}
