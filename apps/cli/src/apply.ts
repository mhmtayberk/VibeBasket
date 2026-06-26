import fs from "node:fs";
import { confirm } from "@inquirer/prompts";
import type { IdeAdapter } from "@vibebasket/adapters";
import {
  AiderAdapter,
  AntigravityAdapter,
  ClaudeCodeAdapter,
  ClineCliAdapter,
  CodeBuddyAdapter,
  CodexAdapter,
  ContinueAdapter,
  CortexCodeAdapter,
  CursorAdapter,
  DeepSeekTuiAdapter,
  GeminiCliAdapter,
  GitHubCopilotAdapter,
  GooseAdapter,
  HermesAdapter,
  IBMBobAdapter,
  JunieAdapter,
  KiroAdapter,
  OpenClawAdapter,
  OpenCodeAdapter,
  RooCodeAdapter,
  VSCodeAdapter,
  VoidAdapter,
  WindsurfAdapter,
  ZedAdapter,
} from "@vibebasket/adapters";
import chalk from "chalk";
import { BundleSchema } from "../../../packages/core/src/manifest.js";
import type { Bundle, IdeId, Scope } from "../../../packages/core/src/manifest.js";
import {
  buildTargetMcpApplyPlan,
  flattenBundleContent,
  getUnsupportedTargetContent,
} from "./apply-helpers.js";
import { createBackup } from "./backup.js";
import { toErrorMessage } from "./errors.js";
import { formatVerificationSummary, verifyTargetInstall } from "./install-verification.js";
import { resolveSecrets } from "./secrets.js";
import { applyWorkflowFiles } from "./workflow-files.js";

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
  const mcpPlans = new Map<IdeId, ReturnType<typeof buildTargetMcpApplyPlan>>();
  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    if (!adapter) continue;

    const mcpPlan = buildTargetMcpApplyPlan(targetId, adapter, flattened.mcps);
    mcpPlans.set(targetId, mcpPlan);

    const unsupportedFeatures = getUnsupportedTargetContent(adapter, flattened);

    if (unsupportedFeatures.length > 0) {
      unsupportedFeatureMessages.push(`${adapter.displayName}: ${unsupportedFeatures.join(", ")}`);
    }

    if (mcpPlan.skipped.length > 0) {
      unsupportedFeatureMessages.push(
        `${adapter.displayName}: skipped MCPs -> ${mcpPlan.skipped
          .map((item) => `${item.displayName} (${item.reason})`)
          .join(", ")}`,
      );
    }
  }

  if (unsupportedFeatureMessages.length > 0) {
    console.log(chalk.yellow("⚠️  Some targets don't support all bundle content:"));
    for (const msg of unsupportedFeatureMessages) {
      console.log(chalk.yellow(`   ${msg}`));
    }
    console.log(
      chalk.gray(
        "   Each target only receives the MCPs, skills, rules, and files it actually supports.\n",
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

  const allRequiredSecrets = Array.from(
    new Set(Array.from(mcpPlans.values()).flatMap((plan) => plan.requiredSecrets)),
  );
  const secrets = await resolveSecrets(allRequiredSecrets);
  const failedTargets: string[] = [];
  const skippedTargets: Array<{ targetId: IdeId; reason: string }> = [];

  if (flattened.files.length > 0) {
    if (scope !== "project" || !projectRoot) {
      console.log(
        chalk.yellow(
          "⚠️  Workflow files were included, but file scaffolds only apply in project scope. Skipping workflow files.",
        ),
      );
    } else if (options.dryRun) {
      console.log(
        chalk.gray(
          `Dry run: would apply ${flattened.files.length} workflow file(s) under ${projectRoot}.`,
        ),
      );
    } else {
      const workflowResult = await applyWorkflowFiles(flattened.files, projectRoot);
      if (workflowResult.written.length > 0) {
        console.log(
          chalk.gray(
            `Applied workflow files: ${workflowResult.written.map((item) => item).join(", ")}`,
          ),
        );
      }
      for (const skipped of workflowResult.skipped) {
        console.log(chalk.yellow(`Skipped workflow file ${skipped.path}: ${skipped.reason}`));
      }
    }
  }

  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    if (!adapter) continue;
    const mcpPlan = mcpPlans.get(targetId);
    if (!mcpPlan) continue;

    console.log(chalk.blue(`\nApplying to ${adapter.displayName}...`));

    try {
      const shouldApplyMcps = adapter.supportsMcp && mcpPlan.supported.length > 0;
      const shouldApplyRules =
        adapter.supportsRules && Boolean(adapter.applyRules) && flattened.rules.length > 0;
      const shouldApplySkills =
        adapter.supportsSkills && Boolean(adapter.applySkills) && flattened.skills.length > 0;

      if (!shouldApplyMcps && !shouldApplyRules && !shouldApplySkills) {
        const skipReason =
          mcpPlan.skipped.length > 0
            ? mcpPlan.skipped.map((item) => `${item.displayName} (${item.reason})`).join(", ")
            : `no compatible content for ${adapter.displayName}`;
        skippedTargets.push({ targetId, reason: skipReason });
        console.log(chalk.gray(`  - Skipped: ${skipReason}`));
        continue;
      }

      if (mcpPlan.credentialNotice) {
        console.log(chalk.gray(`  - ${mcpPlan.credentialNotice}`));
      }

      if (options.dryRun) {
        if (shouldApplyMcps) {
          const config = await adapter.readConfig(scope, projectRoot);
          const pendingConfig = adapter.applyMcps(config, mcpPlan.supported, secrets, {
            force: options.force || false,
          });
          const diff = await adapter.diff(scope, pendingConfig, projectRoot);
          console.log(chalk.gray(`Dry run diff for ${targetId}:\n${diff}`));
        } else {
          console.log(
            chalk.gray(
              `Dry run: ${adapter.displayName} would only receive supported non-MCP content.`,
            ),
          );
        }
      } else {
        if (shouldApplyMcps) {
          const config = await adapter.readConfig(scope, projectRoot);
          const pendingConfig = adapter.applyMcps(config, mcpPlan.supported, secrets, {
            force: options.force || false,
          });
          const backupPath = await createBackup(targetId, scope, config);
          console.log(chalk.gray(`  - Created backup: ${backupPath}`));

          await adapter.writeConfig(scope, pendingConfig, projectRoot);
        }

        if (shouldApplyRules && adapter.applyRules) {
          await adapter.applyRules(flattened.rules, scope, projectRoot);
          console.log(chalk.gray(`  - Successfully applied rules for ${adapter.displayName}`));
        }

        if (shouldApplySkills && adapter.applySkills) {
          await adapter.applySkills(flattened.skills, scope, projectRoot);
          console.log(chalk.gray(`  - Successfully applied skills for ${adapter.displayName}`));
        }

        if (options.verify !== false) {
          const verification = await verifyTargetInstall(targetId, adapter, scope, projectRoot, {
            mcps: shouldApplyMcps ? mcpPlan.supported : [],
            skills: shouldApplySkills ? flattened.skills : [],
            rules: shouldApplyRules ? flattened.rules : [],
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

  if (skippedTargets.length > 0) {
    console.log(chalk.yellow("\nSkipped targets:"));
    for (const skipped of skippedTargets) {
      console.log(chalk.yellow(`- ${skipped.targetId}: ${skipped.reason}`));
    }
  }

  console.log(chalk.bold.green("\n✨ VibeBasket apply complete!\n"));
}
