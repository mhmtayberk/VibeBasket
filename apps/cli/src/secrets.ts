import { password } from "@inquirer/prompts";
import keytar from "keytar";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

const KEYCHAIN_SERVICE = "vibebasket";

export async function resolveSecrets(
  requiredSecrets: string[],
  projectRoot: string = process.cwd()
): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};
  
  // 1. Load from .vibebasket.env if exists
  const envPath = path.join(projectRoot, ".vibebasket.env");
  let localEnv: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    localEnv = dotenv.parse(fs.readFileSync(envPath));
  }

  for (const name of requiredSecrets) {
    // 2. Check process.env
    if (process.env[name]) {
      secrets[name] = process.env[name]!;
      continue;
    }

    // 3. Check .vibebasket.env
    if (localEnv[name]) {
      secrets[name] = localEnv[name];
      continue;
    }

    // 4. Check OS Keychain
    const keychainSecret = await keytar.getPassword(KEYCHAIN_SERVICE, name);
    if (keychainSecret) {
      secrets[name] = keychainSecret;
      continue;
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
