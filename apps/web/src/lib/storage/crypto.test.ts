import { beforeEach, describe, expect, it, vi } from "vitest";

describe("storage crypto", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("AUTH_SECRET", "test-auth-secret");
    vi.stubEnv("NODE_ENV", "test");
  });

  it("round-trips new encrypted payloads with versioned random salt format", async () => {
    const { decryptValue, encryptValue } = await import("./crypto");

    const plaintext = JSON.stringify({ provider: "s3", secretKey: "sk" });
    const encoded = encryptValue(plaintext);

    expect(encoded.startsWith("v2:")).toBe(true);
    expect(decryptValue(encoded)).toBe(plaintext);
  });

  it("keeps legacy static-salt payloads readable for backward compatibility", async () => {
    const crypto = await import("node:crypto");
    const { decryptValue } = await import("./crypto");

    const plaintext = JSON.stringify({ provider: "azure", connectionString: "secret" });
    const key = crypto.scryptSync("test-auth-secret", "vibebasket-salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    const encoded = Buffer.concat([iv, tag, encrypted]).toString("base64");

    expect(decryptValue(encoded)).toBe(plaintext);
  });
});
