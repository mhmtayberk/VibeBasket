"use client";

import type { AppLocale } from "@/i18n/config";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  forceCleanupAction,
  getDbHealthAction,
  getFts5HealthAction,
  getUserOverviewAction,
  rebuildFts5Action,
} from "./health-actions";

interface Fts5Health {
  healthy: boolean;
  catalogRows: number;
  ftsRows: number;
}

interface DbHealth {
  catalogItems: number;
  bundles: number;
  users: number;
  savedStacks: number;
  integrityOk: boolean;
}

interface UserOverview {
  totalUsers: number;
  recentUsers: number;
  totalStacks: number;
}

const COPY = {
  en: {
    title: "System Health",
    loading: "Loading database, search, and user health signals...",
    searchIndex: "Search Index",
    database: "Database",
    statusNotChecked: "Not checked",
    statusHealthy: "Healthy",
    statusMismatch: "Mismatch",
    ftsRows: "FTS5 rows vs catalog rows",
    check: "Check",
    checking: "Checking...",
    rebuild: "Rebuild",
    forceCleanup: "Force Cleanup",
    manual: "Manual",
    forceCleanupBody:
      "Purges expired sessions, verification tokens, old sync records, and expired registered bundles. Runs a vacuum afterward.",
    runCleanup: "Run Cleanup Now",
    running: "Running...",
    userOverview: "User Overview",
    totalUsers: "Total Users",
    newUsersLabel: (days: number) => `${days} new in the last 7 days`,
    registeredAccounts: "Registered accounts",
    savedStacks: "Saved Stacks",
    userBundles: "User-curated bundles",
    refreshUserStats: "Refresh User Stats",
    refreshing: "Loading...",
    querySummary: "Queries users, stacks, and recent signups",
    dbOk: "OK",
    dbCorrupt: "Corrupt",
    rows: "Catalog items",
    bundles: "Bundles",
    users: "Users",
    savedStacksLabel: "Saved stacks",
    tone: {
      healthy: "Healthy",
      warning: "Warning",
      critical: "Critical",
    },
    statusDb: {
      healthy: "OK",
      corrupted: "Corrupt",
    },
  },
  tr: {
    title: "Sistem Sağlığı",
    loading: "Veritabanı, arama ve kullanıcı sağlık sinyalleri yükleniyor...",
    searchIndex: "Arama Dizini",
    database: "Veritabanı",
    statusNotChecked: "Kontrol edilmedi",
    statusHealthy: "Sağlıklı",
    statusMismatch: "Uyumsuz",
    ftsRows: "FTS5 satırları vs katalog satırları",
    check: "Kontrol Et",
    checking: "Kontrol ediliyor...",
    rebuild: "Yeniden Oluştur",
    forceCleanup: "Zorla Temizleme",
    manual: "Manuel",
    forceCleanupBody:
      "Süresi dolmuş oturumları, doğrulama tokenlarını, eski sync kayıtlarını ve süresi dolmuş kayıtlı bundleları kaldırır. Ardından vacuum çalıştırır.",
    runCleanup: "Şimdi Temizle",
    running: "Çalışıyor...",
    userOverview: "Kullanıcı Genel Görünüm",
    totalUsers: "Toplam Kullanıcı",
    newUsersLabel: (days: number) => `Son 7 günde ${days} yeni`,
    registeredAccounts: "Kayıtlı hesaplar",
    savedStacks: "Kaydedilen Stack'ler",
    userBundles: "Kullanıcı tarafından oluşturulan bundle'lar",
    refreshUserStats: "Kullanıcı İstatistiklerini Yenile",
    refreshing: "Yükleniyor...",
    querySummary: "Kullanıcıları, stackleri ve son kayıtları sorgular",
    dbOk: "Tamam",
    dbCorrupt: "Bozuk",
    rows: "Katalog öğeleri",
    bundles: "Bundle'lar",
    users: "Kullanıcılar",
    savedStacksLabel: "Kaydedilmiş stack sayısı",
    tone: {
      healthy: "Sağlıklı",
      warning: "Uyarı",
      critical: "Kritik",
    },
    statusDb: {
      healthy: "Tamam",
      corrupted: "Bozuk",
    },
  },
  es: {
    title: "Estado del sistema",
    loading: "Cargando señales de salud de base de datos, búsqueda y usuarios...",
    searchIndex: "Índice de búsqueda",
    database: "Base de datos",
    statusNotChecked: "No revisado",
    statusHealthy: "Saludable",
    statusMismatch: "Discrepancia",
    ftsRows: "Filas FTS5 vs filas del catálogo",
    check: "Revisar",
    checking: "Revisando...",
    rebuild: "Reconstruir",
    forceCleanup: "Limpieza forzada",
    manual: "Manual",
    forceCleanupBody:
      "Elimina sesiones vencidas, tokens de verificación, registros antiguos de sync y bundles expirados. Luego ejecuta vacuum.",
    runCleanup: "Ejecutar limpieza",
    running: "Ejecutando...",
    userOverview: "Resumen de usuarios",
    totalUsers: "Total de usuarios",
    newUsersLabel: (days: number) => `Nuevos en los últimos 7 días: ${days}`,
    registeredAccounts: "Cuentas registradas",
    savedStacks: "Stacks guardados",
    userBundles: "Bundles creados por usuarios",
    refreshUserStats: "Actualizar estadísticas de usuarios",
    refreshing: "Cargando...",
    querySummary: "Consulta usuarios, stacks y altas recientes",
    dbOk: "Correcto",
    dbCorrupt: "Corrupto",
    rows: "Elementos del catálogo",
    bundles: "Bundles",
    users: "Usuarios",
    savedStacksLabel: "Stacks guardados",
    tone: {
      healthy: "Saludable",
      warning: "Advertencia",
      critical: "Crítico",
    },
    statusDb: {
      healthy: "Correcto",
      corrupted: "Corrupto",
    },
  },
  zh: {
    title: "系统健康",
    loading: "加载数据库、搜索和用户健康信号...",
    searchIndex: "搜索索引",
    database: "数据库",
    statusNotChecked: "未检查",
    statusHealthy: "正常",
    statusMismatch: "不一致",
    ftsRows: "FTS5 行数 vs 目录行数",
    check: "检查",
    checking: "检查中...",
    rebuild: "重建",
    forceCleanup: "强制清理",
    manual: "手动",
    forceCleanupBody: "清理过期会话、验证 token、旧同步记录和过期注册 bundle。随后执行 vacuum。",
    runCleanup: "立即清理",
    running: "执行中...",
    userOverview: "用户总览",
    totalUsers: "用户总数",
    newUsersLabel: (days: number) => `最近 7 天新增 ${days}`,
    registeredAccounts: "已注册账号",
    savedStacks: "已保存 Stack",
    userBundles: "用户自定义 bundle",
    refreshUserStats: "刷新用户统计",
    refreshing: "加载中...",
    querySummary: "查询用户、stack 与最近注册数",
    dbOk: "正常",
    dbCorrupt: "损坏",
    rows: "目录项",
    bundles: "Bundle",
    users: "用户",
    savedStacksLabel: "已保存 stack",
    tone: {
      healthy: "正常",
      warning: "告警",
      critical: "严重",
    },
    statusDb: {
      healthy: "正常",
      corrupted: "损坏",
    },
  },
  hi: {
    title: "सिस्टम स्वास्थ्य",
    loading: "डेटाबेस, सर्च और यूजर स्वास्थ्य सिग्नल लोड हो रहे हैं...",
    searchIndex: "सर्च इंडेक्स",
    database: "डेटाबेस",
    statusNotChecked: "जांच नहीं हुई",
    statusHealthy: "सही",
    statusMismatch: "असंगति",
    ftsRows: "FTS5 रो बनाम कैटलॉग रो",
    check: "जांचें",
    checking: "जांच रहा है...",
    rebuild: "रीबिल्ड",
    forceCleanup: "फोर्स क्लीनअप",
    manual: "मैनुअल",
    forceCleanupBody:
      "Expired sessions, verification tokens, पुराने sync records और expired registered bundles हटाता है, फिर vacuum चलाता है।",
    runCleanup: "अभी क्लीनअप रन करें",
    running: "चल रहा है...",
    userOverview: "यूजर ओवरव्यू",
    totalUsers: "कुल यूजर",
    newUsersLabel: (days: number) => `पिछले 7 दिनों में ${days} नए`,
    registeredAccounts: "रजिस्टर्ड अकाउंट",
    savedStacks: "सेव किए गए स्टैक",
    userBundles: "यूजर-क्यूरेटेड bundles",
    refreshUserStats: "यूजर स्टैट्स रिफ्रेश करें",
    refreshing: "लोड हो रहा है...",
    querySummary: "यूजर, स्टैक और हालिया साइनअप की क्वेरी करता है",
    dbOk: "सही",
    dbCorrupt: "करप्ट",
    rows: "कैटलॉग आइटम",
    bundles: "Bundles",
    users: "यूजर",
    savedStacksLabel: "सहेजे हुए stack",
    tone: {
      healthy: "सही",
      warning: "चेतावनी",
      critical: "गंभीर",
    },
    statusDb: {
      healthy: "सही",
      corrupted: "करप्ट",
    },
  },
  ru: {
    title: "Состояние системы",
    loading: "Загружаются сигналы здоровья базы данных, поиска и пользователей...",
    searchIndex: "Поисковый индекс",
    database: "База данных",
    statusNotChecked: "Не проверено",
    statusHealthy: "Нормально",
    statusMismatch: "Несовпадение",
    ftsRows: "Строки FTS5 против строк каталога",
    check: "Проверить",
    checking: "Проверка...",
    rebuild: "Перестроить",
    forceCleanup: "Force Cleanup",
    manual: "Вручную",
    forceCleanupBody:
      "Удаляет expired sessions, verification tokens, старые sync records и expired registered bundles, затем выполняет vacuum.",
    runCleanup: "Запустить cleanup",
    running: "Выполняется...",
    userOverview: "Обзор пользователей",
    totalUsers: "Всего пользователей",
    newUsersLabel: (days: number) => `${days} новых за последние 7 дней`,
    registeredAccounts: "Зарегистрированные аккаунты",
    savedStacks: "Сохранённые стеки",
    userBundles: "Пользовательские bundles",
    refreshUserStats: "Обновить статистику пользователей",
    refreshing: "Загрузка...",
    querySummary: "Запрашивает пользователей, стеки и недавние регистрации",
    dbOk: "Нормально",
    dbCorrupt: "Повреждена",
    rows: "Элементы каталога",
    bundles: "Bundles",
    users: "Пользователи",
    savedStacksLabel: "Сохранённые стеки",
    tone: {
      healthy: "Нормально",
      warning: "Предупреждение",
      critical: "Критично",
    },
    statusDb: {
      healthy: "Нормально",
      corrupted: "Повреждена",
    },
  },
} as const;

const copyForLocale = (locale: AppLocale) => COPY[locale as keyof typeof COPY] ?? COPY.en;

export function SystemHealthPanel({ locale }: { locale: AppLocale }) {
  const copy = copyForLocale(locale);

  const [fts5, setFts5] = useState<Fts5Health | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);
  const [userOverview, setUserOverview] = useState<UserOverview | null>(null);
  const [ftsLoading, setFtsLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const loadFts5 = useCallback(async () => {
    setFtsLoading(true);
    const result = await getFts5HealthAction();
    if (result.success) {
      const r = result as unknown as Fts5Health;
      setFts5(r);
    } else {
      toast.error(result.error ?? "Failed");
    }
    setFtsLoading(false);
  }, []);

  const handleRebuild = async () => {
    setFtsLoading(true);
    const result = await rebuildFts5Action();
    if (result.success) {
      toast.success("Search index rebuilt");
      await loadFts5();
    } else {
      toast.error(result.error ?? "Rebuild failed");
    }
    setFtsLoading(false);
  };

  const loadDbHealth = useCallback(async () => {
    setDbLoading(true);
    const result = await getDbHealthAction();
    if (result.success) {
      const r = result as unknown as DbHealth;
      setDbHealth(r);
    } else {
      toast.error(result.error ?? "Failed");
    }
    setDbLoading(false);
  }, []);

  const handleCleanup = async () => {
    setCleanupLoading(true);
    const result = await forceCleanupAction();
    if (result.success) {
      toast.success("Cleanup completed");
      await loadDbHealth();
    } else {
      toast.error(result.error ?? "Cleanup failed");
    }
    setCleanupLoading(false);
  };

  const loadUserOverview = useCallback(async () => {
    setUserLoading(true);
    const result = await getUserOverviewAction();
    if (result.success) {
      const r = result as unknown as UserOverview;
      setUserOverview(r);
    } else {
      toast.error(result.error ?? "Failed");
    }
    setUserLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await Promise.all([loadFts5(), loadDbHealth(), loadUserOverview()]);
      if (!cancelled) {
        setInitialLoadComplete(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadDbHealth, loadFts5, loadUserOverview]);

  return (
    <section id="system-health" className="mt-10 scroll-mt-40 space-y-10">
      <div className="border-t border-border/80 pt-10">
        <h2 className="text-2xl font-semibold text-foreground mb-6">{copy.title}</h2>

        {!initialLoadComplete && (ftsLoading || dbLoading || userLoading) ? (
          <div className="mb-6 border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
            {copy.loading}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.searchIndex}
              </span>
              <span
                className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  fts5 === null
                    ? "border-border/70 bg-background/50 text-muted-foreground"
                    : fts5.healthy
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {fts5 === null
                  ? copy.statusNotChecked
                  : fts5.healthy
                    ? copy.tone.healthy
                    : copy.statusMismatch}
              </span>
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">
              {fts5 === null ? "—" : `${fts5.ftsRows} / ${fts5.catalogRows}`}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{copy.ftsRows}</p>
            <div className="mt-5 flex gap-3 pt-5 border-t border-border/70">
              <button
                type="button"
                onClick={loadFts5}
                disabled={ftsLoading}
                className="border border-border/70 bg-background/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
              >
                {ftsLoading ? copy.checking : copy.check}
              </button>
              <button
                type="button"
                onClick={handleRebuild}
                disabled={ftsLoading}
                className="border border-accent/30 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {copy.rebuild}
              </button>
            </div>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.database}
              </span>
              <span
                className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  dbHealth === null
                    ? "border-border/70 bg-background/50 text-muted-foreground"
                    : dbHealth.integrityOk
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {dbHealth === null
                  ? copy.statusNotChecked
                  : dbHealth.integrityOk
                    ? copy.statusDb.healthy
                    : copy.statusDb.corrupted}
              </span>
            </div>
            <div className="mt-6 space-y-2 font-mono text-xs leading-6">
              {dbHealth && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{copy.rows}</span>
                    <span className="text-foreground">
                      {dbHealth.catalogItems.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{copy.bundles}</span>
                    <span className="text-foreground">{dbHealth.bundles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{copy.users}</span>
                    <span className="text-foreground">{dbHealth.users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{copy.savedStacksLabel}</span>
                    <span className="text-foreground">{dbHealth.savedStacks.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-5 flex gap-3 pt-5 border-t border-border/70">
              <button
                type="button"
                onClick={loadDbHealth}
                disabled={dbLoading}
                className="border border-border/70 bg-background/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
              >
                {dbLoading ? copy.refreshing : copy.check}
              </button>
            </div>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.forceCleanup}
              </span>
              <span className="inline-flex items-center border border-border/70 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.manual}
              </span>
            </div>
            <div className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {copy.forceCleanupBody}
            </div>
            <div className="mt-5 pt-5 border-t border-border/70">
              <button
                type="button"
                onClick={handleCleanup}
                disabled={cleanupLoading}
                className="inline-flex w-full items-center justify-center border border-accent/30 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {cleanupLoading ? copy.running : copy.runCleanup}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="user-overview" className="border-t border-border/80 pt-10 scroll-mt-40">
        <h2 className="text-2xl font-semibold text-foreground mb-6">{copy.userOverview}</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.totalUsers}
              </span>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">
              {userOverview === null ? "—" : userOverview.totalUsers.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {userOverview !== null && userOverview.recentUsers > 0
                ? copy.newUsersLabel(userOverview.recentUsers)
                : copy.registeredAccounts}
            </p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {copy.savedStacks}
              </span>
              <span className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <div className="mt-6 text-4xl font-extrabold text-foreground">
              {userOverview === null ? "—" : userOverview.totalStacks.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{copy.userBundles}</p>
          </div>

          <div className="border border-border/80 bg-card/70 p-6 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={loadUserOverview}
              disabled={userLoading}
              className="border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {userLoading ? copy.refreshing : copy.refreshUserStats}
            </button>
            <p className="mt-3 text-[10px] text-muted-foreground">{copy.querySummary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
