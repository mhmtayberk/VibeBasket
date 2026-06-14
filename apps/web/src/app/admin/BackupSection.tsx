"use client";

import { Check, Clock, Loader2, Settings, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  backupDatabaseAction,
  deleteBackupAction,
  getStorageConfigAction,
  listBackupsAction,
  removeStorageConfigAction,
  restoreBackupAction,
  saveScheduleAction,
  saveStorageConfigAction,
} from "./backup-actions";

interface BackupEntry {
  key: string;
  sizeBytes: number;
  lastModified: string;
}

interface DbConfig {
  backend: string;
  hasS3: boolean;
  hasAzure: boolean;
  hasGcs: boolean;
}

interface BackendInfo {
  id: string;
  configuredId: string;
  isFallback: boolean;
  warning: string | null;
}

interface BackendStatus {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  isConfigured: boolean;
  missingVars: string[];
  envPrefix: string;
}

type ConfigMode = { backend: string; label: string } | null;

const FIELD_LABELS: Record<string, string> = {
  endpoint: "Endpoint URL",
  bucket: "Bucket / Container Name",
  region: "Region",
  accessKey: "Access Key ID",
  secretKey: "Secret Access Key",
  connectionString: "Connection String",
  container: "Container Name",
  projectId: "Project ID",
};

function backendFields(backend: string): string[] {
  switch (backend) {
    case "s3":
    case "r2":
    case "spaces":
      return ["endpoint", "region", "bucket", "accessKey", "secretKey"];
    case "azure":
      return ["connectionString", "container"];
    case "gcs":
      return ["bucket", "projectId"];
    default:
      return [];
  }
}

export function BackupSection() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [backends, setBackends] = useState<BackendStatus[]>([]);
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<ConfigMode>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pendingBackups, setPendingBackups] = useState<Set<string>>(new Set());
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleHours, setScheduleHours] = useState(24);

  const refreshBackups = useCallback(() => {
    listBackupsAction().then((res) => {
      if (res.success) {
        setBackups(
          res.backups.map((b) => ({
            ...b,
            lastModified:
              b.lastModified instanceof Date
                ? b.lastModified.toISOString()
                : String(b.lastModified),
          })),
        );
      }
    });
  }, []);

  const refreshAll = useCallback(() => {
    getStorageConfigAction().then((res) => {
      if (res.success) {
        setDbConfig(res.config);
        setBackends(res.backends);
        setBackendInfo(res.backendInfo ?? null);
        if (res.schedule) {
          setScheduleEnabled(res.schedule.enabled);
          setScheduleHours(res.schedule.intervalHours);
        } else {
          setScheduleEnabled(false);
          setScheduleHours(24);
        }
      }
    });
    refreshBackups();
  }, [refreshBackups]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleBackup = (label: string) => {
    setResult(null);
    const opKey = `backup-${Date.now()}`;
    setPendingBackups((prev) => new Set(prev).add(opKey));

    (async () => {
      try {
        const response = await backupDatabaseAction();
        if (response.success && response.backup) {
          setResult({
            success: true,
            message: `${response.backup.storageLabel}: ${response.backup.key} (${(response.backup.sizeBytes / 1024).toFixed(1)} KB)`,
          });
          refreshBackups();
        } else {
          setResult({
            success: false,
            message: response.error || "Failed to create backup.",
          });
        }
      } catch (err: unknown) {
        setResult({
          success: false,
          message: err instanceof Error ? err.message : "Backup failed.",
        });
      } finally {
        setPendingBackups((prev) => {
          const next = new Set(prev);
          next.delete(opKey);
          return next;
        });
      }
    })();

    return opKey;
  };

  const handleDelete = (key: string) => {
    startTransition(async () => {
      try {
        const response = await deleteBackupAction(key);
        setResult({
          success: response.success,
          message: response.success ? `Deleted: ${key}` : (response.error ?? "Delete failed."),
        });
        if (response.success) refreshBackups();
      } catch {
        setResult({ success: false, message: "Delete failed." });
      }
    });
  };

  const handleRestore = (key: string) => {
    if (!window.confirm(`Restore from "${key}"? Overwrites current DB.`)) return;
    setRestoringKey(key);
    startTransition(async () => {
      try {
        const response = await restoreBackupAction(key);
        setResult({
          success: response.success,
          message: response.success
            ? (response.message ?? "Restored.")
            : (response.error ?? "Restore failed."),
        });
      } catch {
        setResult({ success: false, message: "Restore failed." });
      } finally {
        setRestoringKey(null);
      }
    });
  };

  const handleSaveConfig = () => {
    if (!configMode) return;
    setResult(null);
    startTransition(async () => {
      try {
        const response = await saveStorageConfigAction(configMode.backend, formValues);
        if (response.success) {
          setResult({ success: true, message: `Switched to ${configMode.label}.` });
          setConfigMode(null);
          refreshAll();
        } else {
          setResult({ success: false, message: response.error ?? "Failed to save." });
        }
      } catch {
        setResult({ success: false, message: "Save failed." });
      }
    });
  };

  const handleRemoveConfig = () => {
    if (!window.confirm("Remove stored configuration? Falls back to env vars or local.")) return;
    startTransition(async () => {
      try {
        const response = await removeStorageConfigAction();
        if (response.success) {
          setResult({ success: true, message: "Configuration removed." });
          refreshAll();
        }
      } catch {
        setResult({ success: false, message: "Failed to remove." });
      }
    });
  };

  const isDbConfigured = dbConfig && dbConfig.backend !== "local";
  const hasPendingBackups = pendingBackups.size > 0;

  return (
    <div className="space-y-8">
      {/* ── Config Form ── */}
      {configMode && (
        <div className="border border-accent/40 bg-accent/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Configure {configMode.label}
            </span>
            <button
              type="button"
              onClick={() => setConfigMode(null)}
              className="inline-flex h-8 items-center border border-border/60 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {backendFields(configMode.backend).map((field) => (
              <div key={field}>
                <label
                  htmlFor={`storage-config-${field}`}
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1"
                >
                  {FIELD_LABELS[field] ?? field}
                </label>
                <input
                  id={`storage-config-${field}`}
                  type={field === "secretKey" ? "password" : "text"}
                  value={formValues[field] ?? ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full border border-border/70 bg-background/50 px-3 py-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
                  placeholder={field}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 border border-accent bg-accent px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save & Activate"}
            </button>
          </div>

          <p className="font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
            Credentials are encrypted with AES-256-GCM. Never stored in plaintext.
          </p>
        </div>
      )}

      {/* ── Backend Table ── */}
      <div>
        {backendInfo?.isFallback ? (
          <div className="mb-4 border border-amber-500/35 bg-amber-500/8 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
              Storage fallback active
            </p>
            <p className="mt-1 text-sm text-amber-100/85">{backendInfo.warning}</p>
          </div>
        ) : null}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Storage Backends
          </span>
          <div className="flex items-center gap-3">
            {isDbConfigured && (
              <button
                type="button"
                onClick={handleRemoveConfig}
                className="inline-flex items-center gap-1 border border-border/50 bg-background/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Reset to Env
              </button>
            )}
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/60">
              {isDbConfigured ? "DB-managed" : "ENV-managed"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/70">
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-8" />
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Backend
                </th>
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hidden sm:table-cell">
                  Status
                </th>
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-20" />
              </tr>
            </thead>
            <tbody>
              {backends.map((backend) => (
                <tr
                  key={backend.id}
                  className={`border-b border-border/50 last:border-b-0 ${backend.isActive ? "bg-accent/5" : ""}`}
                >
                  <td className="py-2.5 pr-4">
                    {backend.isActive ? (
                      <span className="inline-flex items-center justify-center h-5 w-5 border border-accent/50 bg-accent/10">
                        <Check className="h-3 w-3 text-accent" />
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="text-sm font-medium text-foreground">{backend.label}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {backend.description}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${
                        backend.isConfigured
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border/50 bg-background/30 text-muted-foreground"
                      }`}
                    >
                      {backend.isConfigured ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {backend.id === "local"
                        ? "Always Ready"
                        : backend.isConfigured
                          ? "Ready"
                          : "Missing"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {backend.id !== "local" ? (
                      configMode && configMode.backend === backend.id ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent px-1.5 py-1">
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setConfigMode({ backend: backend.id, label: backend.label });
                            setFormValues({});
                          }}
                          className="inline-flex items-center gap-1 border border-border/50 bg-background/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-accent/60 hover:bg-accent/10 hover:text-accent"
                        >
                          <Settings className="h-3 w-3" />
                          {backend.isConfigured ? "Edit" : "Setup"}
                        </button>
                      )
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Schedule ── */}
      <div className="border-t border-border/70 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Scheduled Backups
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Automated periodic snapshots
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="h-4 w-4 border border-border/70 bg-background accent-accent"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
              Enable
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Every
            </span>
            <input
              type="number"
              min={1}
              max={720}
              value={scheduleHours}
              onChange={(e) => setScheduleHours(Number(e.target.value))}
              disabled={!scheduleEnabled}
              className="w-20 border border-border/70 bg-background/50 px-2 py-1.5 font-mono text-[11px] text-foreground text-center outline-none focus:border-accent/50 disabled:opacity-40"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              hours
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                const response = await saveScheduleAction(scheduleEnabled, scheduleHours);
                setResult({
                  success: response.success,
                  message: response.success ? "Schedule saved." : (response.error ?? "Failed."),
                });
              });
            }}
            disabled={isPending || !scheduleEnabled}
            className="inline-flex h-9 items-center gap-1.5 border border-border/60 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Clock className="h-3.5 w-3.5" />
            Save Schedule
          </button>
        </div>

        <p className="mt-3 font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
          When enabled, a backup is automatically created every {scheduleHours} hour
          {scheduleHours !== 1 ? "s" : ""}. The check runs when the admin dashboard is visited.
          Schedule state persists across restarts.
        </p>
      </div>

      {/* ── Backup Operations ── */}
      <div className="border-t border-border/70 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Backup Operations
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {backends.find((b) => b.isActive)?.label ?? "Local Filesystem"}
            {hasPendingBackups ? ` (${pendingBackups.size} active)` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleBackup("create")}
            disabled={isPending}
            className={`inline-flex h-10 items-center justify-center gap-2 border px-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-all ${
              isPending
                ? "border-border/50 bg-background/30 text-muted-foreground cursor-not-allowed"
                : "border-accent bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(160,253,218,0.15)]"
            }`}
          >
            {hasPendingBackups ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...
              </>
            ) : (
              "Create Backup"
            )}
          </button>

          {backups.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowBackups(!showBackups);
                if (!showBackups) refreshBackups();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 border border-border/70 bg-background/40 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5"
            >
              {showBackups ? "Hide Backups" : `Show Backups (${backups.length})`}
            </button>
          )}
        </div>

        {result && (
          <div
            className={`border p-3 font-mono text-[10px] leading-relaxed mb-4 ${
              result.success
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <span className="font-bold">{result.success ? "[OK]" : "[ERR]"}</span> {result.message}
          </div>
        )}

        {showBackups && backups.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-1 border border-border/50">
            {backups.map((backup) => (
              <div
                key={backup.key}
                className="flex items-center justify-between gap-2 border-b border-border/40 py-2 px-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[11px] text-foreground">{backup.key}</div>
                  <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                    {(backup.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                    {new Date(backup.lastModified).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRestore(backup.key)}
                    disabled={!!restoringKey}
                    className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent hover:text-foreground transition-colors"
                  >
                    {restoringKey === backup.key ? "..." : "Restore"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${backup.key}"?`)) handleDelete(backup.key);
                    }}
                    disabled={isPending}
                    className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
