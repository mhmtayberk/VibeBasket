import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const TAG_POSITION = IV_LENGTH;
const VERSION_PREFIX = "v2:";
const LEGACY_SALT = "vibebasket-salt";

function getSecret(): string {
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "vibebasket-dev-only-secret-change-me" : null);

  if (!secret) {
    throw new Error("AUTH_SECRET is required for encrypted storage operations.");
  }

  return secret;
}

function deriveKey(salt: Buffer | string): Buffer {
  return crypto.scryptSync(getSecret(), salt, KEY_LENGTH);
}

export function encryptValue(plaintext: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${VERSION_PREFIX}${Buffer.concat([salt, iv, tag, encrypted]).toString("base64")}`;
}

export function decryptValue(encoded: string): string {
  const isVersioned = encoded.startsWith(VERSION_PREFIX);
  const buffer = Buffer.from(
    isVersioned ? encoded.slice(VERSION_PREFIX.length) : encoded,
    "base64",
  );
  const offset = isVersioned ? SALT_LENGTH : 0;
  const key = isVersioned ? deriveKey(buffer.subarray(0, SALT_LENGTH)) : deriveKey(LEGACY_SALT);
  const iv = buffer.subarray(offset, offset + IV_LENGTH);
  const tag = buffer.subarray(offset + IV_LENGTH, offset + TAG_POSITION + TAG_LENGTH);
  const encrypted = buffer.subarray(offset + TAG_POSITION + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final("utf8");
}

export function sealConfig(config: Record<string, unknown>): string {
  return encryptValue(JSON.stringify(config));
}

export function unsealConfig<T = Record<string, unknown>>(
  encryptedConfig: string | null | undefined,
): T | null {
  if (!encryptedConfig) return null;
  try {
    const json = decryptValue(encryptedConfig);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
