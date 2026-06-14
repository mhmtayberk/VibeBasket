import fs from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";

interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
}

export class S3StorageBackend implements StorageBackend {
  readonly id: StorageBackendId;
  readonly label: string;
  readonly isConfigured: boolean;
  private config: S3Config;

  constructor(id: StorageBackendId, label: string, config: S3Config) {
    this.id = id;
    this.label = label;
    this.config = config;
    this.isConfigured = Boolean(
      config.endpoint && config.bucket && config.accessKey && config.secretKey,
    );
  }

  private async getS3Client() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: !this.config.endpoint.includes("amazonaws.com"),
    });
  }

  async createBackup(localPath: string, key: string): Promise<CreateBackupResult> {
    const s3 = await this.getS3Client();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");

    const body = await fs.promises.readFile(localPath);
    const stat = await fs.promises.stat(localPath);

    await s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: "application/octet-stream",
      }),
    );

    return {
      key,
      sizeBytes: stat.size,
      location: `${this.config.endpoint}/${this.config.bucket}/${key}`,
    };
  }

  async downloadBackup(key: string, destinationPath: string): Promise<void> {
    const s3 = await this.getS3Client();
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`Backup "${key}" could not be downloaded from ${this.label}.`);
    }

    if ("pipe" in response.Body && typeof response.Body.pipe === "function") {
      await pipeline(response.Body as NodeJS.ReadableStream, fs.createWriteStream(destinationPath));
      return;
    }

    if (
      "transformToWebStream" in response.Body &&
      typeof response.Body.transformToWebStream === "function"
    ) {
      const webStream = await response.Body.transformToWebStream();
      await pipeline(
        Readable.fromWeb(webStream as NodeReadableStream),
        fs.createWriteStream(destinationPath),
      );
      return;
    }

    if (
      "transformToByteArray" in response.Body &&
      typeof response.Body.transformToByteArray === "function"
    ) {
      const bytes = await response.Body.transformToByteArray();
      await fs.promises.writeFile(destinationPath, Buffer.from(bytes));
      return;
    }

    throw new Error(`Backup "${key}" returned an unsupported S3 response body.`);
  }

  async listBackups(): Promise<BackupEntry[]> {
    const s3 = await this.getS3Client();
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");

    try {
      const result = (await s3.send(
        new ListObjectsV2Command({
          Bucket: this.config.bucket,
        }),
      )) as { Contents?: Array<{ Key?: string; Size?: number; LastModified?: Date }> };

      return (result.Contents ?? [])
        .filter((obj): obj is typeof obj & { Key: string; Size: number; LastModified: Date } =>
          Boolean(obj.Key),
        )
        .map((obj) => ({
          key: obj.Key,
          sizeBytes: obj.Size ?? 0,
          lastModified: obj.LastModified ?? new Date(0),
        }))
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch {
      return [];
    }
  }

  async deleteBackup(key: string): Promise<void> {
    const s3 = await this.getS3Client();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );
  }
}
