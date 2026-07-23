import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { password } from "@inquirer/prompts";
import chalk from "chalk";
import dotenv from "dotenv";

const KEYCHAIN_SERVICE = "vibebasket";
const require = createRequire(import.meta.url);

type KeytarModule = {
  getPassword(service: string, account: string): Promise<string | null>;
};

let keytarModulePromise: Promise<KeytarModule | null> | null = null;

async function loadKeytar(): Promise<KeytarModule | null> {
  if (!keytarModulePromise) {
    keytarModulePromise = Promise.resolve().then(() => {
      try {
        const mod = require("keytar") as KeytarModule | { default?: KeytarModule };
        return "default" in mod ? (mod.default ?? null) : mod;
      } catch {
        return null;
      }
    });
  }

  return keytarModulePromise;
}

export async function resolveSecrets(
  requiredSecrets: string[],
  projectRoot: string = process.cwd(),
  options: { interactive?: boolean } = {},
): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};
  const interactive = options.interactive !== false;

  // 1. Load from .vibebasket.env if exists
  const envPath = path.join(projectRoot, ".vibebasket.env");
  let localEnv: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    localEnv = dotenv.parse(fs.readFileSync(envPath));
  }

  for (const name of requiredSecrets) {
    // 2. Check process.env
    const envValue = process.env[name];
    if (envValue) {
      secrets[name] = envValue;
      continue;
    }

    // 3. Check .vibebasket.env
    if (localEnv[name]) {
      secrets[name] = localEnv[name];
      continue;
    }

    // 4. Check OS Keychain
    const keytar = await loadKeytar();
    if (keytar) {
      const keychainSecret = await keytar.getPassword(KEYCHAIN_SERVICE, name);
      if (keychainSecret) {
        secrets[name] = keychainSecret;
        continue;
      }
    }

    if (!interactive) {
      throw new Error(`Missing required secret: ${name}`);
    }

    // 5. Interactive Prompt
    console.log(chalk.yellow(`\nMissing secret: ${chalk.bold(name)}`));
    const value = await password({
      message: `Enter value for ${name}:`,
      validate: (v) => v.length > 0 || "Value cannot be empty",
    });

    secrets[name] = value;

    // Optional: Save to keychain
    // For now, we'll just keep it in memory for the session.
    // In a future update, we can add a prompt to save to keychain.
  }

  return secrets;
}
