import chalk from "chalk";
import type { Scope } from "../../../packages/core/src/manifest.js";
import { executeBundleApply } from "./services/apply-service.js";
import { loadBundleFromInput } from "./services/bundle-service.js";

export async function applyBundle(
  input: string,
  options: { scope?: string; force?: boolean; dryRun?: boolean; verify?: boolean },
) {
  const bundle = await loadBundleFromInput(input);
  const scope = (options.scope || bundle.scope) as Scope;
  const projectRoot = scope === "project" ? process.cwd() : undefined;

  console.log(chalk.bold("\n📦 Bundle Summary:"));
  console.log(
    `- MCP Servers: ${bundle.mcps.length + bundle.workflowPacks.flatMap((entry) => entry.mcps).length}`,
  );
  console.log(
    `- Skills: ${bundle.skills.length + bundle.workflowPacks.flatMap((entry) => entry.skills).length}`,
  );
  console.log(
    `- Rules: ${bundle.rules.length + bundle.workflowPacks.flatMap((entry) => entry.rules).length}`,
  );
  console.log(`- Workflow Files: ${bundle.workflowPacks.flatMap((entry) => entry.files).length}`);
  console.log(`- Targets: ${bundle.targets.join(", ")}`);
  console.log(`- Scope: ${scope}\n`);

  if (!options.force) {
    const { confirm } = await import("@inquirer/prompts");
    const ok = await confirm({
      message: "Do you trust this bundle and want to apply it?",
      default: true,
    });
    if (!ok) {
      console.log(chalk.red("Aborted."));
      return;
    }
  }
  const result = await executeBundleApply(bundle, {
    scope,
    force: options.force ?? false,
    dryRun: options.dryRun ?? false,
    verify: options.verify !== false,
    projectRoot,
    interactiveSecrets: true,
    logger: {
      info(message) {
        console.log(chalk.gray(message));
      },
      warn(message) {
        console.log(chalk.yellow(message));
      },
      error(message) {
        console.error(chalk.red(message));
      },
    },
  });

  if (result.unsupportedFeatureMessages.length > 0) {
    console.log(chalk.yellow("⚠️  Some targets don't support all bundle content:"));
    for (const message of result.unsupportedFeatureMessages) {
      console.log(chalk.yellow(`   ${message}`));
    }
    console.log(
      chalk.gray(
        "   Each target only receives the MCPs, skills, rules, and files it actually supports.\n",
      ),
    );
  }

  if (result.workflowFilesApplied.length > 0) {
    console.log(chalk.gray(`Applied workflow files: ${result.workflowFilesApplied.join(", ")}`));
  }
  for (const skipped of result.workflowFilesSkipped) {
    console.log(chalk.yellow(`Skipped workflow file ${skipped.path}: ${skipped.reason}`));
  }

  for (const targetResult of result.targetResults) {
    console.log(chalk.blue(`\nApplying to ${targetResult.displayName}...`));
    if (!targetResult.applied) {
      console.log(chalk.gray(`  - Skipped: ${targetResult.skippedReason}`));
      continue;
    }
    if (targetResult.backupPath) {
      console.log(chalk.gray(`  - Created backup: ${targetResult.backupPath}`));
    }
    if (targetResult.verificationSummary) {
      console.log(chalk.gray(`  - Verified install: ${targetResult.verificationSummary}`));
    }
    console.log(chalk.green(`✅ Successfully applied to ${targetResult.displayName}`));
    if (targetResult.postInstallHint) {
      console.log(chalk.cyan(`💡 ${targetResult.postInstallHint}`));
    }
  }

  if (result.failedTargets.length > 0) {
    throw new Error(
      `Bundle apply was incomplete. Failed targets: ${result.failedTargets
        .map((target) => target.targetId)
        .join(", ")}.`,
    );
  }

  console.log(chalk.bold.green("\n✨ VibeBasket apply complete!\n"));
}
