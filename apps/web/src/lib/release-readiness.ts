import { type AuthProviderEnv, getAuthProviderReadiness } from "../auth.config";
import type { BackupRuntimeStatus } from "./backup-runtime-status";
import type { StorageBackendId } from "./storage";

export type ReleaseReadinessTone = "healthy" | "warning" | "critical";

export interface StorageBackendInfoLike {
  id: StorageBackendId;
  configuredId: StorageBackendId;
  isConfigured: boolean;
  isFallback: boolean;
  warning: string | null;
}

export interface ReleaseReadinessItem {
  key: string;
  label: string;
  tone: ReleaseReadinessTone;
  detail: string;
}

export interface ReleaseReadinessReport {
  tone: ReleaseReadinessTone;
  blockers: ReleaseReadinessItem[];
  warnings: ReleaseReadinessItem[];
  checks: ReleaseReadinessItem[];
}

interface BackupReadinessContext {
  schedule?: {
    enabled: boolean;
    intervalHours: number;
    lastScheduledAt: string | null;
  } | null;
  runtimeStatus?: BackupRuntimeStatus | null;
}

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTruthy(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());
}

function looksLocalhost(url: string) {
  return /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(url);
}

function deriveOverallTone(
  blockers: ReleaseReadinessItem[],
  warnings: ReleaseReadinessItem[],
): ReleaseReadinessTone {
  if (blockers.length > 0) {
    return "critical";
  }
  if (warnings.length > 0) {
    return "warning";
  }
  return "healthy";
}

export function buildReleaseReadinessReport(
  env: AuthProviderEnv & {
    NEXTAUTH_URL?: string;
    CATALOG_REFRESH_TOKEN?: string;
    BACKUP_JOB_TOKEN?: string;
    TRUST_PROXY?: string;
    DATABASE_URL?: string;
  },
  storageInfo: StorageBackendInfoLike,
  backupContext: BackupReadinessContext = {},
): ReleaseReadinessReport {
  const blockers: ReleaseReadinessItem[] = [];
  const warnings: ReleaseReadinessItem[] = [];
  const checks: ReleaseReadinessItem[] = [];
  const isProduction = env.NODE_ENV === "production";
  const nextAuthUrl = env.NEXTAUTH_URL?.trim() ?? "";
  const providerReadiness = getAuthProviderReadiness(env);
  const enabledProviders = providerReadiness.filter((provider) => provider.enabled);
  const configuredProviders = providerReadiness.filter((provider) => provider.configured);
  const misconfiguredProviders = providerReadiness.filter(
    (provider) => provider.enabled && !provider.configured,
  );

  if (isProduction && !hasValue(env.AUTH_SECRET)) {
    blockers.push({
      key: "auth-secret",
      label: "AUTH_SECRET missing",
      tone: "critical",
      detail:
        "Production auth sessions and encrypted backup credentials require a real AUTH_SECRET.",
    });
  } else {
    checks.push({
      key: "auth-secret",
      label: "AUTH_SECRET",
      tone: "healthy",
      detail: isProduction
        ? "Configured for production session security."
        : "Development fallback is allowed outside production.",
    });
  }

  if (!hasValue(nextAuthUrl)) {
    blockers.push({
      key: "nextauth-url-missing",
      label: "NEXTAUTH_URL missing",
      tone: "critical",
      detail: "OAuth callbacks and metadata URLs need a stable public base URL.",
    });
  } else if (isProduction && looksLocalhost(nextAuthUrl)) {
    blockers.push({
      key: "nextauth-url-local",
      label: "NEXTAUTH_URL points to localhost",
      tone: "critical",
      detail: `Production is still configured with ${nextAuthUrl}. Replace it with the final public domain.`,
    });
  } else {
    checks.push({
      key: "nextauth-url",
      label: "NEXTAUTH_URL",
      tone: "healthy",
      detail: `Base URL set to ${nextAuthUrl}.`,
    });
  }

  if (isProduction && !isTruthy(env.AUTH_TRUST_HOST)) {
    warnings.push({
      key: "auth-trust-host",
      label: "AUTH_TRUST_HOST disabled",
      tone: "warning",
      detail:
        "Enable this when deploying behind a trusted proxy or CDN so OAuth callbacks trust forwarded host headers.",
    });
  } else {
    checks.push({
      key: "auth-trust-host",
      label: "AUTH_TRUST_HOST",
      tone: "healthy",
      detail: isProduction
        ? "Trusted host forwarding is enabled."
        : "Development trusts host headers automatically.",
    });
  }

  if (isProduction && !isTruthy(env.TRUST_PROXY)) {
    warnings.push({
      key: "trust-proxy",
      label: "TRUST_PROXY disabled",
      tone: "warning",
      detail:
        "Keep this enabled behind Nginx, Caddy, Cloudflare, or another trusted reverse proxy so rate limiting sees the real client IP.",
    });
  } else if (isTruthy(env.TRUST_PROXY)) {
    checks.push({
      key: "trust-proxy",
      label: "TRUST_PROXY",
      tone: "healthy",
      detail: "Forwarded client IP headers are trusted for rate limiting.",
    });
  }

  if (enabledProviders.length === 0) {
    warnings.push({
      key: "oauth-none",
      label: "No OAuth providers enabled",
      tone: "warning",
      detail: "Login UI stays unavailable until at least one provider is enabled and configured.",
    });
  } else {
    checks.push({
      key: "oauth-enabled",
      label: "OAuth providers",
      tone: "healthy",
      detail: `${configuredProviders.length} provider${configuredProviders.length === 1 ? "" : "s"} ready: ${configuredProviders.map((provider) => provider.label).join(", ")}.`,
    });
  }

  for (const provider of misconfiguredProviders) {
    warnings.push({
      key: `oauth-${provider.id}`,
      label: `${provider.label} config incomplete`,
      tone: "warning",
      detail: `Enabled flag is on, but these values are missing: ${provider.missingEnv.join(", ")}.`,
    });
  }

  if (isProduction && !hasValue(env.CATALOG_REFRESH_TOKEN)) {
    warnings.push({
      key: "catalog-refresh-token",
      label: "CATALOG_REFRESH_TOKEN missing",
      tone: "warning",
      detail: "Protected remote refresh calls cannot be authenticated without a refresh token.",
    });
  } else if (hasValue(env.CATALOG_REFRESH_TOKEN)) {
    checks.push({
      key: "catalog-refresh-token",
      label: "CATALOG_REFRESH_TOKEN",
      tone: "healthy",
      detail: "Protected remote catalog refresh is available.",
    });
  }

  if (storageInfo.isFallback) {
    blockers.push({
      key: "storage-fallback",
      label: "Backup backend fallback active",
      tone: "critical",
      detail:
        storageInfo.warning ??
        `Configured backup backend "${storageInfo.configuredId}" is incomplete and has fallen back to "${storageInfo.id}".`,
    });
  } else if (!storageInfo.isConfigured) {
    warnings.push({
      key: "storage-unconfigured",
      label: "Backup storage not configured",
      tone: "warning",
      detail: "Backups are not ready yet. Configure a local or cloud backend before launch.",
    });
  } else {
    checks.push({
      key: "storage-backend",
      label: "Backup storage",
      tone: "healthy",
      detail: `Active backend is ${storageInfo.id}.`,
    });
  }

  if (backupContext.schedule?.enabled) {
    if (!hasValue(env.BACKUP_JOB_TOKEN)) {
      warnings.push({
        key: "backup-job-token",
        label: "BACKUP_JOB_TOKEN missing",
        tone: "warning",
        detail:
          "Scheduled backups are enabled, but no protected backup job token is configured for an external scheduler.",
      });
    } else {
      checks.push({
        key: "backup-job-token",
        label: "BACKUP_JOB_TOKEN",
        tone: "healthy",
        detail: "Protected scheduled backup endpoint can be called by an external scheduler.",
      });
    }

    const lastSuccessAt = backupContext.runtimeStatus?.lastSuccessAt;
    if (!lastSuccessAt) {
      warnings.push({
        key: "backup-runtime-status",
        label: "No successful scheduled backup recorded",
        tone: "warning",
        detail:
          "A schedule exists, but no successful backup run has been recorded yet. Trigger one before relying on disaster recovery.",
      });
    } else {
      const intervalMs = backupContext.schedule.intervalHours * 60 * 60 * 1000;
      const ageMs = Date.now() - new Date(lastSuccessAt).getTime();
      if (Number.isFinite(ageMs) && ageMs > intervalMs * 2) {
        warnings.push({
          key: "backup-runtime-stale",
          label: "Scheduled backup looks stale",
          tone: "warning",
          detail: `Last successful backup was recorded at ${lastSuccessAt}, which is older than twice the configured ${backupContext.schedule.intervalHours}-hour interval.`,
        });
      } else {
        checks.push({
          key: "backup-runtime-status",
          label: "Scheduled backup history",
          tone: "healthy",
          detail: `Last successful backup recorded at ${lastSuccessAt}.`,
        });
      }
    }
  }

  if (env.DATABASE_URL && !env.DATABASE_URL.startsWith("file:")) {
    warnings.push({
      key: "database-url",
      label: "Non-SQLite database URL detected",
      tone: "warning",
      detail:
        "Built-in backup and restore flows are designed for SQLite file databases. Verify your database backup strategy separately.",
    });
  } else {
    checks.push({
      key: "database-url",
      label: "SQLite backup compatibility",
      tone: "healthy",
      detail: "Database URL is file-based, so built-in backup and restore can operate directly.",
    });
  }

  return {
    tone: deriveOverallTone(blockers, warnings),
    blockers,
    warnings,
    checks,
  };
}
