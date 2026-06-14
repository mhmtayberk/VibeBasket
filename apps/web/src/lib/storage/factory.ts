import { loadStorageConfig, resolveBackendId as resolveDbBackendId } from "./db-config";
import { LocalStorageBackend } from "./local";
import type { StorageBackend, StorageBackendId } from "./types";

const STORAGE_BACKEND_OPTIONS: Array<{
  id: StorageBackendId;
  label: string;
  description: string;
  envPrefix: string;
}> = [
  {
    id: "local",
    label: "Local Filesystem",
    description: "Backups stored in a local directory (BACKUP_LOCAL_DIR)",
    envPrefix: "BACKUP_LOCAL",
  },
  {
    id: "s3",
    label: "AWS S3",
    description: "Amazon Simple Storage Service (BACKUP_S3_*)",
    envPrefix: "BACKUP_S3",
  },
  {
    id: "r2",
    label: "Cloudflare R2",
    description: "Cloudflare R2 object storage — S3-compatible (BACKUP_R2_*)",
    envPrefix: "BACKUP_R2",
  },
  {
    id: "spaces",
    label: "DigitalOcean Spaces",
    description: "DigitalOcean Spaces — S3-compatible (BACKUP_SPACES_*)",
    envPrefix: "BACKUP_SPACES",
  },
  {
    id: "azure",
    label: "Azure Blob Storage",
    description: "Microsoft Azure Blob Storage (BACKUP_AZURE_*)",
    envPrefix: "BACKUP_AZURE",
  },
  {
    id: "gcs",
    label: "Google Cloud Storage",
    description: "Google Cloud Storage (BACKUP_GCS_*)",
    envPrefix: "BACKUP_GCS",
  },
] as const;

export { STORAGE_BACKEND_OPTIONS };

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

function buildS3Config(prefix: string) {
  return {
    endpoint: readEnv(`${prefix}_ENDPOINT`),
    region: readEnv(`${prefix}_REGION`),
    bucket: readEnv(`${prefix}_BUCKET`),
    accessKey: readEnv(`${prefix}_ACCESS_KEY`),
    secretKey: readEnv(`${prefix}_SECRET_KEY`),
  };
}

function isS3ConfigComplete(config: ReturnType<typeof buildS3Config>): boolean {
  return Boolean(config.endpoint && config.bucket && config.accessKey && config.secretKey);
}

function resolveBackendId(): StorageBackendId {
  const configured = readEnv("BACKUP_STORAGE_BACKEND");
  if (STORAGE_BACKEND_OPTIONS.some((opt) => opt.id === configured)) {
    return configured as StorageBackendId;
  }
  return "local";
}

async function resolveBackendIdPreferDb(): Promise<StorageBackendId> {
  try {
    return resolveDbBackendId();
  } catch {
    return resolveBackendId();
  }
}

async function createS3BackendFromConfig(
  id: "s3" | "r2" | "spaces",
  label: string,
  s3Config: {
    endpoint: string;
    region?: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  },
): Promise<StorageBackend | null> {
  const { S3StorageBackend } = await import("./s3");
  return new S3StorageBackend(id, label, {
    endpoint: s3Config.endpoint,
    region: s3Config.region ?? "auto",
    bucket: s3Config.bucket,
    accessKey: s3Config.accessKey,
    secretKey: s3Config.secretKey,
  });
}

async function createAzureBackendFromConfig(config: {
  connectionString: string;
  container: string;
}): Promise<StorageBackend | null> {
  const { AzureStorageBackend } = await import("./azure");
  return new AzureStorageBackend(config);
}

async function createGcsBackendFromConfig(config: {
  bucket: string;
  projectId: string;
}): Promise<StorageBackend | null> {
  const { GcsStorageBackend } = await import("./gcs");
  return new GcsStorageBackend(config);
}

async function tryDbBackend(): Promise<StorageBackend | null> {
  try {
    const dbConfig = await loadStorageConfig();
    if (!dbConfig) return null;

    const id = dbConfig.backend;

    switch (id) {
      case "s3":
      case "r2":
      case "spaces": {
        const s3cfg = dbConfig.s3;
        if (!s3cfg?.endpoint || !s3cfg?.bucket || !s3cfg?.accessKey || !s3cfg?.secretKey)
          return null;
        return createS3BackendFromConfig(
          id,
          STORAGE_BACKEND_OPTIONS.find((o) => o.id === id)?.label ?? id,
          s3cfg,
        );
      }
      case "azure": {
        const acfg = dbConfig.azure;
        if (!acfg?.connectionString || !acfg?.container) return null;
        return createAzureBackendFromConfig(acfg);
      }
      case "gcs": {
        const gcfg = dbConfig.gcs;
        if (!gcfg?.bucket || !gcfg?.projectId) return null;
        return createGcsBackendFromConfig(gcfg);
      }
      case "local":
        return createLocalBackend();
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function createS3Backend(
  id: "s3" | "r2" | "spaces",
  label: string,
): Promise<StorageBackend | null> {
  const config = buildS3Config(`BACKUP_${id.toUpperCase()}`);
  if (!isS3ConfigComplete(config)) {
    return null;
  }
  const { S3StorageBackend } = await import("./s3");
  return new S3StorageBackend(id, label, config);
}

async function createAzureBackend(): Promise<StorageBackend | null> {
  const connectionString = readEnv("BACKUP_AZURE_CONNECTION_STRING");
  const container = readEnv("BACKUP_AZURE_CONTAINER");
  if (!connectionString || !container) {
    return null;
  }
  const { AzureStorageBackend } = await import("./azure");
  return new AzureStorageBackend({ connectionString, container });
}

async function createGcsBackend(): Promise<StorageBackend | null> {
  const bucket = readEnv("BACKUP_GCS_BUCKET");
  const projectId = readEnv("BACKUP_GCS_PROJECT_ID");
  if (!bucket || !projectId) {
    return null;
  }
  const { GcsStorageBackend } = await import("./gcs");
  return new GcsStorageBackend({ bucket, projectId });
}

function createLocalBackend(): LocalStorageBackend {
  return new LocalStorageBackend({
    backupsDir: readEnv("BACKUP_LOCAL_DIR") || undefined,
  });
}

function isDbConfigComplete(
  id: StorageBackendId,
  dbConfig: Awaited<ReturnType<typeof loadStorageConfig>> | null,
): boolean {
  switch (id) {
    case "local":
      return true;
    case "s3":
    case "r2":
    case "spaces":
      return Boolean(
        dbConfig?.backend === id &&
          dbConfig.s3?.endpoint &&
          dbConfig.s3?.bucket &&
          dbConfig.s3?.accessKey &&
          dbConfig.s3?.secretKey,
      );
    case "azure":
      return Boolean(
        dbConfig?.backend === id && dbConfig.azure?.connectionString && dbConfig.azure?.container,
      );
    case "gcs":
      return Boolean(dbConfig?.backend === id && dbConfig.gcs?.bucket && dbConfig.gcs?.projectId);
    default:
      return false;
  }
}

export async function createStorageBackend(): Promise<StorageBackend> {
  const dbBackend = await tryDbBackend();
  if (dbBackend) return dbBackend;

  const id = resolveBackendId();

  switch (id) {
    case "s3": {
      const backend = await createS3Backend("s3", "AWS S3");
      return backend ?? createLocalBackend();
    }
    case "r2": {
      const backend = await createS3Backend("r2", "Cloudflare R2");
      return backend ?? createLocalBackend();
    }
    case "spaces": {
      const backend = await createS3Backend("spaces", "DigitalOcean Spaces");
      return backend ?? createLocalBackend();
    }
    case "azure": {
      const backend = await createAzureBackend();
      return backend ?? createLocalBackend();
    }
    case "gcs": {
      const backend = await createGcsBackend();
      return backend ?? createLocalBackend();
    }
    default:
      return createLocalBackend();
  }
}

export async function getStorageBackendInfo() {
  const id = await resolveBackendIdPreferDb();
  const option = STORAGE_BACKEND_OPTIONS.find((opt) => opt.id === id);
  const backend = await createStorageBackend();
  return {
    id: backend.id,
    label: backend.label,
    configuredId: id,
    description: option?.description ?? "",
    isConfigured: backend.isConfigured,
    isFallback: backend.id !== id,
    warning:
      backend.id !== id
        ? `Configured backend "${id}" is incomplete. Falling back to "${backend.id}".`
        : null,
  };
}

export interface BackendStatus {
  id: StorageBackendId;
  label: string;
  description: string;
  isActive: boolean;
  isConfigured: boolean;
  missingVars: string[];
  envPrefix: string;
}

export async function getAllBackendsStatus(): Promise<BackendStatus[]> {
  const activeId = await resolveBackendIdPreferDb();
  const dbConfig = await loadStorageConfig().catch(() => null);

  return STORAGE_BACKEND_OPTIONS.map((opt) => {
    const missingVars: string[] = [];

    switch (opt.id) {
      case "local":
        break;
      case "s3":
      case "r2":
      case "spaces": {
        const prefix = `BACKUP_${opt.id.toUpperCase()}`;
        const config = buildS3Config(prefix);
        if (!readEnv(`${prefix}_ENDPOINT`)) missingVars.push(`${prefix}_ENDPOINT`);
        if (!readEnv(`${prefix}_BUCKET`)) missingVars.push(`${prefix}_BUCKET`);
        if (!readEnv(`${prefix}_ACCESS_KEY`)) missingVars.push(`${prefix}_ACCESS_KEY`);
        if (!readEnv(`${prefix}_SECRET_KEY`)) missingVars.push(`${prefix}_SECRET_KEY`);
        break;
      }
      case "azure":
        if (!readEnv("BACKUP_AZURE_CONNECTION_STRING"))
          missingVars.push("BACKUP_AZURE_CONNECTION_STRING");
        if (!readEnv("BACKUP_AZURE_CONTAINER")) missingVars.push("BACKUP_AZURE_CONTAINER");
        break;
      case "gcs":
        if (!readEnv("BACKUP_GCS_BUCKET")) missingVars.push("BACKUP_GCS_BUCKET");
        if (!readEnv("BACKUP_GCS_PROJECT_ID")) missingVars.push("BACKUP_GCS_PROJECT_ID");
        break;
    }

    return {
      id: opt.id,
      label: opt.label,
      description: opt.description,
      isActive: opt.id === activeId,
      isConfigured:
        isDbConfigComplete(opt.id, dbConfig) || opt.id === "local" || missingVars.length === 0,
      missingVars,
      envPrefix: opt.envPrefix,
    };
  });
}
