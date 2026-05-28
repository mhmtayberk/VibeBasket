import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const TAG_POSITION = IV_LENGTH;

function getEncryptionKey(): Buffer {
	const secret =
		process.env.AUTH_SECRET ||
		process.env.NODE_ENV === "development"
			? "vibebasket-dev-only-secret-change-me"
			: null;

	if (!secret) {
		throw new Error(
			"AUTH_SECRET is required for encrypted storage operations.",
		);
	}

	return crypto.scryptSync(secret, "vibebasket-salt", 32);
}

export function encryptValue(plaintext: string): string {
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();

	return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptValue(encoded: string): string {
	const key = getEncryptionKey();
	const buffer = Buffer.from(encoded, "base64");

	const iv = buffer.subarray(0, IV_LENGTH);
	const tag = buffer.subarray(IV_LENGTH, TAG_POSITION + TAG_LENGTH);
	const encrypted = buffer.subarray(TAG_POSITION + TAG_LENGTH);

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);

	return decipher.update(encrypted) + decipher.final("utf8");
}

export interface EncryptedString {
	__encrypted: true;
	value: string;
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
