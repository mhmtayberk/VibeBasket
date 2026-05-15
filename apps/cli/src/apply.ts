import fs from "node:fs";
import { BundleSchema } from "@vibebasket/core";
import type { Bundle } from "@vibebasket/core";
import { 
  CursorAdapter, 
  AntigravityAdapter, 
  WindsurfAdapter, 
  VSCodeAdapter,
  ClaudeCodeAdapter,
  GeminiCliAdapter,
  KiroAdapter,
  JunieAdapter,
  ClineCliAdapter,
  ZedAdapter,
  CodexAdapter,
} from "@vibebasket/adapters";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { resolveSecrets } from "./secrets.js";
import { createBackup } from "./backup.js";

const ADAPTERS = {
  cursor: new CursorAdapter(),
  antigravity: new AntigravityAdapter(),
  windsurf: new WindsurfAdapter(),
  vscode: new VSCodeAdapter(),
  "claude-code": new ClaudeCodeAdapter(),
  "gemini-cli": new GeminiCliAdapter(),
  kiro: new KiroAdapter(),
  junie: new JunieAdapter(),
  "cline-cli": new ClineCliAdapter(),
  zed: new ZedAdapter(),
  codex: new CodexAdapter(),
} as const;

export async function applyBundle(
  input: string,
  options: { scope?: string; force?: boolean; dryRun?: boolean }
) {
  let manifest: any;

  // 1. Resolve manifest
  if (input.startsWith("http")) {
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to fetch bundle: ${res.statusText}`);
    manifest = await res.json();
  } else {
    const content = fs.readFileSync(input, "utf-8");
    manifest = JSON.parse(content);
  }

  // 2. Validate
  const bundle = BundleSchema.parse(manifest);
  const scope = (options.scope || bundle.scope) as any;
  const projectRoot = scope === "project" ? process.cwd() : undefined;

  // 3. Trust Prompt
  console.log(chalk.bold("\n📦 Bundle Summary:"));
  console.log(`- MCP Servers: ${bundle.mcps.length}`);
  console.log(`- Skills: ${bundle.skills.length}`);
  console.log(`- Rules: ${bundle.rules.length}`);
  console.log(`- Targets: ${bundle.targets.join(", ")}`);
  console.log(`- Scope: ${scope}\n`);

  if (!options.force) {
    const ok = await confirm({ message: "Do you trust this bundle and want to apply it?", default: true });
    if (!ok) {
      console.log(chalk.red("Aborted."));
      return;
    }
  }

  // 4. Resolve Secrets
  const allRequiredSecrets = bundle.mcps.flatMap(m => m.requiredSecrets);
  const secrets = await resolveSecrets(allRequiredSecrets);

  // 5. Apply per Target
  for (const targetId of bundle.targets) {
    const adapter = (ADAPTERS as any)[targetId];
    if (!adapter) {
      console.warn(chalk.yellow(`\n⚠️  No adapter found for target: ${targetId}. Skipping.`));
      continue;
    }

    if (!adapter.supportedScopes.includes(scope)) {
      console.warn(chalk.yellow(`\n⚠️  ${adapter.displayName} does not support ${scope} scope. Skipping.`));
      continue;
    }

    console.log(chalk.blue(`\nApplying to ${adapter.displayName}...`));

    try {
      const config = await adapter.readConfig(scope, projectRoot);
      const pendingConfig = adapter.applyMcps(config, bundle.mcps, secrets, { force: options.force || false });

      if (options.dryRun) {
        const diff = await adapter.diff(scope, pendingConfig, projectRoot);
        console.log(chalk.gray(`Dry run diff for ${targetId}:\n${diff}`));
      } else {
        const backupPath = await createBackup(targetId, scope, config);
        console.log(chalk.gray(`  - Created backup: ${backupPath}`));
        
        await adapter.writeConfig(scope, pendingConfig, projectRoot);
        console.log(chalk.green(`✅ Successfully applied to ${adapter.displayName}`));
        console.log(chalk.cyan(`💡 ${adapter.postInstallHint()}`));
      }
    } catch (err: any) {
      console.error(chalk.red(`❌ Failed to apply to ${targetId}: ${err.message}`));
    }
  }

  console.log(chalk.bold.green("\n✨ VibeBasket apply complete!\n"));
}
