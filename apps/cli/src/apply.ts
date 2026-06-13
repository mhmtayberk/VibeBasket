import fs from "node:fs";
import { BundleSchema } from "@vibebasket/core";
import type { Bundle, IdeId, Scope } from "@vibebasket/core";
import type { IdeAdapter } from "@vibebasket/adapters";
import {
  CursorAdapter,
  AntigravityAdapter,
  WindsurfAdapter,
  VSCodeAdapter,
  ClaudeCodeAdapter,
  DeepSeekTuiAdapter,
  GeminiCliAdapter,
  KiroAdapter,
  JunieAdapter,
  ClineCliAdapter,
  ZedAdapter,
  CodexAdapter,
  ContinueAdapter,
  RooCodeAdapter,
  HermesAdapter,
  OpenClawAdapter,
  GitHubCopilotAdapter,
  VoidAdapter,
  AiderAdapter,
  CortexCodeAdapter,
  GooseAdapter,
  IBMBobAdapter,
  CodeBuddyAdapter,
  OpenCodeAdapter,
} from "@vibebasket/adapters";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { resolveSecrets } from "./secrets.js";
import { createBackup } from "./backup.js";
import { toErrorMessage } from "./errors.js";
import { flattenBundleContent, getUnsupportedTargetContent } from "./apply-helpers.js";
import { formatVerificationSummary, verifyTargetInstall } from "./install-verification.js";

const ADAPTERS = {
  cursor: new CursorAdapter(),
  antigravity: new AntigravityAdapter(),
  windsurf: new WindsurfAdapter(),
  vscode: new VSCodeAdapter(),
  "claude-code": new ClaudeCodeAdapter(),
  "deepseek-tui": new DeepSeekTuiAdapter(),
  "gemini-cli": new GeminiCliAdapter(),
  kiro: new KiroAdapter(),
  junie: new JunieAdapter(),
  "cline-cli": new ClineCliAdapter(),
  zed: new ZedAdapter(),
  codex: new CodexAdapter(),
  continue: new ContinueAdapter(),
  roocode: new RooCodeAdapter(),
  hermes: new HermesAdapter(),
  openclaw: new OpenClawAdapter(),
  "github-copilot": new GitHubCopilotAdapter(),
  void: new VoidAdapter(),
  aider: new AiderAdapter(),
  "cortex-code": new CortexCodeAdapter(),
  goose: new GooseAdapter(),
  "ibm-bob": new IBMBobAdapter(),
  codebuddy: new CodeBuddyAdapter(),
  opencode: new OpenCodeAdapter(),
} as const;

function getAdapter(targetId: IdeId): IdeAdapter | undefined {
  return ADAPTERS[targetId as keyof typeof ADAPTERS];
}

export async function applyBundle(
  input: string,
  options: { scope?: string; force?: boolean; dryRun?: boolean; verify?: boolean },
) {
  let manifest: unknown;

  if (input.startsWith("http")) {
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to fetch bundle: ${res.statusText}`);
    manifest = await res.json();
  } else {
    const content = fs.readFileSync(input, "utf-8");
    manifest = JSON.parse(content);
  }

  const bundle = BundleSchema.parse(manifest);
  const scope = (options.scope || bundle.scope) as Scope;
  const projectRoot = scope === "project" ? process.cwd() : undefined;
  const flattened = flattenBundleContent(bundle);

  console.log(chalk.bold("\n📦 Bundle Summary:"));
  console.log(`- MCP Servers: ${flattened.mcps.length}`);
  console.log(`- Skills: ${flattened.skills.length}`);
  console.log(`- Rules: ${flattened.rules.length}`);
  console.log(`- Workflow Files: ${flattened.files.length}`);
  console.log(`- Targets: ${bundle.targets.join(", ")}`);
  console.log(`- Scope: ${scope}\n`);

  const unsupportedTargets = bundle.targets.filter((targetId) => !getAdapter(targetId));
  if (unsupportedTargets.length > 0) {
    throw new Error(
      `This bundle references targets the current apply engine cannot install yet: ${unsupportedTargets.join(", ")}.`,
    );
  }

  const scopeUnsupportedTargets = bundle.targets.filter((targetId) => {
    const adapter = getAdapter(targetId);
    return adapter ? !adapter.supportedScopes.includes(scope) : false;
  });
  if (scopeUnsupportedTargets.length > 0) {
    throw new Error(
      `This bundle cannot be applied at ${scope} scope for: ${scopeUnsupportedTargets.join(", ")}.`,
    );
  }

  const unsupportedFeatureMessages: string[] = [];
  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    if (!adapter) continue;

    const unsupportedFeatures = getUnsupportedTargetContent(adapter, flattened);

    if (unsupportedFeatures.length > 0) {
      unsupportedFeatureMessages.push(`${adapter.displayName}: ${unsupportedFeatures.join(", ")}`);
    }
  }

  if (unsupportedFeatureMessages.length > 0) {
    console.log(chalk.yellow("⚠️  Some targets don't support all bundle content:"));
    for (const msg of unsupportedFeatureMessages) {
      console.log(chalk.yellow(`   ${msg}`));
    }
    console.log(
      chalk.gray(
        "   MCP will be applied to all targets. Skills/rules will be applied only to targets that support them.\n",
      ),
    );
  }

  if (!options.force) {
    const ok = await confirm({
      message: "Do you trust this bundle and want to apply it?",
      default: true,
    });
    if (!ok) {
      console.log(chalk.red("Aborted."));
      return;
    }
  }

  const allRequiredSecrets = flattened.mcps.flatMap((mcp) => mcp.requiredSecrets);
  const secrets = await resolveSecrets(allRequiredSecrets);
  const failedTargets: string[] = [];

  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    if (!adapter) continue;

    console.log(chalk.blue(`\nApplying to ${adapter.displayName}...`));

    try {
      const config = await adapter.readConfig(scope, projectRoot);
      const pendingConfig = adapter.applyMcps(config, flattened.mcps, secrets, {
        force: options.force || false,
      });

      if (options.dryRun) {
        const diff = await adapter.diff(scope, pendingConfig, projectRoot);
        console.log(chalk.gray(`Dry run diff for ${targetId}:\n${diff}`));
      } else {
        const backupPath = await createBackup(targetId, scope, config);
        console.log(chalk.gray(`  - Created backup: ${backupPath}`));

        await adapter.writeConfig(scope, pendingConfig, projectRoot);

        // Auto-apply rules if supported
        if (adapter.supportsRules && adapter.applyRules && flattened.rules.length > 0) {
          await adapter.applyRules(flattened.rules, scope, projectRoot);
          console.log(chalk.gray(`  - Successfully applied rules for ${adapter.displayName}`));
        }

        // Auto-apply skills if supported
        if (adapter.supportsSkills && adapter.applySkills && flattened.skills.length > 0) {
          await adapter.applySkills(flattened.skills, scope, projectRoot);
          console.log(chalk.gray(`  - Successfully applied skills for ${adapter.displayName}`));
        }

        if (options.verify !== false) {
          const verification = await verifyTargetInstall(targetId, adapter, scope, projectRoot, {
            mcps: flattened.mcps,
            skills: adapter.supportsSkills && adapter.applySkills ? flattened.skills : [],
            rules: adapter.supportsRules && adapter.applyRules ? flattened.rules : [],
          });

          if (!verification.ok) {
            throw new Error(
              `Post-install verification failed (${formatVerificationSummary(verification)})`,
            );
          }

          console.log(
            chalk.gray(`  - Verified install: ${formatVerificationSummary(verification)}`),
          );
        }

        console.log(chalk.green(`✅ Successfully applied to ${adapter.displayName}`));
        console.log(chalk.cyan(`💡 ${adapter.postInstallHint()}`));
      }
    } catch (error) {
      failedTargets.push(targetId);
      console.error(chalk.red(`❌ Failed to apply to ${targetId}: ${toErrorMessage(error)}`));
    }
  }

  if (failedTargets.length > 0) {
    throw new Error(`Bundle apply was incomplete. Failed targets: ${failedTargets.join(", ")}.`);
  }

  console.log(chalk.bold.green("\n✨ VibeBasket apply complete!\n"));
}
