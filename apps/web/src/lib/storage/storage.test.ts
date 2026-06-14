import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── LocalStorageBackend ────────────────────────────────────────────────

describe("LocalStorageBackend", () => {
  let tmpDir: string;
  let LocalStorageBackend: typeof import("./local").LocalStorageBackend;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `vibebasket-test-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });
    const mod = await import("./local");
    LocalStorageBackend = mod.LocalStorageBackend;
  });

  afterEach(async () => {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  it("creates a backup file in the configured directory", async () => {
    const backupDir = path.join(tmpDir, "backups");
    const sourceFile = path.join(tmpDir, "source.db");
    await fs.promises.writeFile(sourceFile, "database-content");

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    const result = await backend.createBackup(sourceFile, "backup-1.db");

    expect(result.key).toBe("backup-1.db");
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(result.location).toBe(path.join(backupDir, "backup-1.db"));

    expect(result.location).toBeDefined();
    const stats = await fs.promises.stat(result.location ?? "");
    expect(stats.isFile()).toBe(true);
  });

  it("lists backups sorted by last modified descending", async () => {
    const backupDir = path.join(tmpDir, "backups");
    const sourceFile = path.join(tmpDir, "source.db");
    await fs.promises.writeFile(sourceFile, "content");

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    await backend.createBackup(sourceFile, "backup-old.db");
    await new Promise((r) => setTimeout(r, 10));
    await backend.createBackup(sourceFile, "backup-new.db");

    const list = await backend.listBackups();
    expect(list.length).toBe(2);
    expect(list[0].key).toBe("backup-new.db");
    expect(list[1].key).toBe("backup-old.db");
  });

  it("deletes a backup", async () => {
    const backupDir = path.join(tmpDir, "backups");
    const sourceFile = path.join(tmpDir, "source.db");
    await fs.promises.writeFile(sourceFile, "content");

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    await backend.createBackup(sourceFile, "to-delete.db");
    await backend.deleteBackup("to-delete.db");

    const list = await backend.listBackups();
    expect(list).toHaveLength(0);
  });

  it("downloads a backup back to a destination path", async () => {
    const backupDir = path.join(tmpDir, "backups");
    const sourceFile = path.join(tmpDir, "source.db");
    const restoredFile = path.join(tmpDir, "restored.db");
    await fs.promises.writeFile(sourceFile, "database-content");

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    await backend.createBackup(sourceFile, "backup-restore.db");
    await backend.downloadBackup("backup-restore.db", restoredFile);

    const restored = await fs.promises.readFile(restoredFile, "utf8");
    expect(restored).toBe("database-content");
  });

  it("returns empty list for non-existent directory", async () => {
    const backend = new LocalStorageBackend({
      backupsDir: path.join(tmpDir, "nonexistent"),
    });
    const list = await backend.listBackups();
    expect(list).toEqual([]);
  });

  it("creates backups directory if it does not exist", async () => {
    const backupDir = path.join(tmpDir, "auto-created");
    const sourceFile = path.join(tmpDir, "source.db");
    await fs.promises.writeFile(sourceFile, "content");

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    await backend.createBackup(sourceFile, "auto.db");

    const dirStat = await fs.promises.stat(backupDir);
    expect(dirStat.isDirectory()).toBe(true);
  });

  it("handles large file backup (50MB equivalent)", async () => {
    const backupDir = path.join(tmpDir, "backups");
    const sourceFile = path.join(tmpDir, "large-source.db");
    const content = Buffer.alloc(1024 * 1024 + 512, "x");
    await fs.promises.writeFile(sourceFile, content);

    const backend = new LocalStorageBackend({ backupsDir: backupDir });
    const result = await backend.createBackup(sourceFile, "large.db");

    expect(result.sizeBytes).toBe(content.length);
  });
});

// ── Storage Factory ──────────────────────────────────────────────────────

describe("createStorageBackend", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns LocalStorageBackend when no backend is configured", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("local");
  });

  it("returns LocalStorageBackend when backend is invalid", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "invalid-backend");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("local");
  });

  it("returns LocalStorageBackend when s3 is configured but missing credentials", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "s3");
    vi.stubEnv("BACKUP_S3_BUCKET", "my-bucket");
    // missing endpoint, access key, secret key
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("local");
  });

  it("returns S3StorageBackend when s3 is fully configured", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "s3");
    vi.stubEnv("BACKUP_S3_ENDPOINT", "https://s3.amazonaws.com");
    vi.stubEnv("BACKUP_S3_REGION", "us-east-1");
    vi.stubEnv("BACKUP_S3_BUCKET", "my-bucket");
    vi.stubEnv("BACKUP_S3_ACCESS_KEY", "ak");
    vi.stubEnv("BACKUP_S3_SECRET_KEY", "sk");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("s3");
    expect(backend.label).toBe("AWS S3");
  });

  it("returns S3StorageBackend for r2 when configured", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "r2");
    vi.stubEnv("BACKUP_R2_ENDPOINT", "https://account.r2.cloudflarestorage.com");
    vi.stubEnv("BACKUP_R2_REGION", "auto");
    vi.stubEnv("BACKUP_R2_BUCKET", "my-bucket");
    vi.stubEnv("BACKUP_R2_ACCESS_KEY", "ak");
    vi.stubEnv("BACKUP_R2_SECRET_KEY", "sk");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("r2");
    expect(backend.label).toBe("Cloudflare R2");
  });

  it("returns AzureStorageBackend when configured", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "azure");
    vi.stubEnv(
      "BACKUP_AZURE_CONNECTION_STRING",
      "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key;",
    );
    vi.stubEnv("BACKUP_AZURE_CONTAINER", "vibebasket-backups");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("azure");
    expect(backend.label).toBe("Azure Blob Storage");
  });

  it("returns GcsStorageBackend when configured", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "gcs");
    vi.stubEnv("BACKUP_GCS_BUCKET", "my-bucket");
    vi.stubEnv("BACKUP_GCS_PROJECT_ID", "my-project");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("gcs");
    expect(backend.label).toBe("Google Cloud Storage");
  });

  it("returns LocalStorageBackend for spaces when missing credentials", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "spaces");
    // no spaces config
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("local");
  });

  it("returns LocalStorageBackend for azure without connection string", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "azure");
    vi.stubEnv("BACKUP_AZURE_CONTAINER", "container");
    const { createStorageBackend } = await import("./factory");
    const backend = await createStorageBackend();
    expect(backend.id).toBe("local");
  });
});

// ── Storage Backend Info ─────────────────────────────────────────────────

describe("getStorageBackendInfo", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns local info by default", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "");
    const { getStorageBackendInfo } = await import("./factory");
    const info = await getStorageBackendInfo();
    expect(info.id).toBe("local");
    expect(info.configuredId).toBe("local");
    expect(info.isFallback).toBe(false);
  });

  it("reflects the configured backend id", async () => {
    vi.stubEnv("BACKUP_STORAGE_BACKEND", "s3");
    vi.stubEnv("BACKUP_S3_ENDPOINT", "https://s3.amazonaws.com");
    vi.stubEnv("BACKUP_S3_BUCKET", "b");
    vi.stubEnv("BACKUP_S3_ACCESS_KEY", "ak");
    vi.stubEnv("BACKUP_S3_SECRET_KEY", "sk");
    const { getStorageBackendInfo } = await import("./factory");
    const info = await getStorageBackendInfo();
    expect(info.configuredId).toBe("s3");
    expect(info.id).toBe("s3");
    expect(info.isFallback).toBe(false);
  });
});

// ── Chaos / Edge Case Tests ─────────────────────────────────────────────

describe("Storage edge cases", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("handles concurrent backup creation for local storage", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-chaos-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    try {
      const backupDir = path.join(tmpDir, "backups");
      const sourceFile = path.join(tmpDir, "source.db");
      await fs.promises.writeFile(sourceFile, "content");

      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: backupDir });

      const results = await Promise.all([
        backend.createBackup(sourceFile, "concurrent-1.db"),
        backend.createBackup(sourceFile, "concurrent-2.db"),
        backend.createBackup(sourceFile, "concurrent-3.db"),
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].key).toBe("concurrent-1.db");
      expect(results[1].key).toBe("concurrent-2.db");
      expect(results[2].key).toBe("concurrent-3.db");

      const list = await backend.listBackups();
      expect(list).toHaveLength(3);
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles backup of missing source file", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-missing-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    try {
      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: tmpDir });
      await expect(
        backend.createBackup(path.join(tmpDir, "does-not-exist.db"), "backup.db"),
      ).rejects.toThrow();
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles delete of non-existent backup gracefully", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-del-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    try {
      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: tmpDir });
      await expect(backend.deleteBackup("never-created.db")).rejects.toThrow();
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles zero-byte source file backup", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-zero-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    try {
      const sourceFile = path.join(tmpDir, "empty.db");
      await fs.promises.writeFile(sourceFile, "");

      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: tmpDir });
      const result = await backend.createBackup(sourceFile, "empty-backup.db");

      expect(result.sizeBytes).toBe(0);
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles special characters in backup key", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-special-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    try {
      const sourceFile = path.join(tmpDir, "source.db");
      await fs.promises.writeFile(sourceFile, "content");

      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: tmpDir });
      const safeKey = "backup-2026-05-28T13-30-00.db";
      const result = await backend.createBackup(sourceFile, safeKey);

      expect(result.key).toBe(safeKey);
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("listBackups skips non-file entries silently", async () => {
    const tmpDir = path.join(os.tmpdir(), `vibebasket-nonfile-${Date.now()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });
    const backupDir = path.join(tmpDir, "backups");
    await fs.promises.mkdir(backupDir);
    const subDir = path.join(backupDir, "subdir");
    await fs.promises.mkdir(subDir);

    const sourceFile = path.join(tmpDir, "source.db");
    await fs.promises.writeFile(sourceFile, "content");

    try {
      const { LocalStorageBackend } = await import("./local");
      const backend = new LocalStorageBackend({ backupsDir: backupDir });
      await backend.createBackup(sourceFile, "real.db");

      const list = await backend.listBackups();
      expect(list.length).toBe(1);
      expect(list[0].key).toBe("real.db");
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("STORAGE_BACKEND_OPTIONS contains all 6 backends", async () => {
    const { STORAGE_BACKEND_OPTIONS } = await import("./factory");
    expect(STORAGE_BACKEND_OPTIONS).toHaveLength(6);
    const ids = STORAGE_BACKEND_OPTIONS.map((o) => o.id);
    expect(ids).toContain("local");
    expect(ids).toContain("s3");
    expect(ids).toContain("r2");
    expect(ids).toContain("spaces");
    expect(ids).toContain("azure");
    expect(ids).toContain("gcs");
  });

  it("all backends have a label and description", async () => {
    const { STORAGE_BACKEND_OPTIONS } = await import("./factory");
    for (const opt of STORAGE_BACKEND_OPTIONS) {
      expect(opt.label).toBeTruthy();
      expect(opt.description).toBeTruthy();
      expect(opt.envPrefix).toBeTruthy();
    }
  });
});
