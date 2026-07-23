import fs from "node:fs";
import path from "node:path";
import type { IdeAdapter } from "@vibebasket/adapters";
import chalk from "chalk";
import { extractConfiguredMcpIds } from "./config-inspection.js";
import { getAllAdapters } from "./runtime/adapters.js";

const ADAPTERS: [string, IdeAdapter][] = getAllAdapters().map((entry) => [
  entry[1].displayName,
  entry[1],
]);

export async function runDoctor() {
  console.log(chalk.cyan("🧺 VibeBasket: Running diagnostics...\n"));

  const projectRoot = process.cwd();
  const vbDir = path.join(projectRoot, ".vibebasket");
  if (fs.existsSync(vbDir)) {
    console.log(chalk.green("✔ Project structure (.vibebasket/) found."));
  } else {
    console.log(chalk.yellow("⚠ .vibebasket/ not found. Run 'vibebasket init' to set up."));
  }

  const envPath = path.join(projectRoot, ".vibebasket.env");
  if (fs.existsSync(envPath)) {
    console.log(chalk.green("✔ .vibebasket.env found."));
  } else {
    console.log(chalk.yellow("⚠ .vibebasket.env not found."));
  }

  console.log(chalk.blue("\nIDE Configurations:\n"));

  let foundCount = 0;
  let mcpTotal = 0;

  for (const [name, adapter] of ADAPTERS) {
    const configPath = adapter.supportsMcp ? adapter.configPath("user") : null;
    const hasConfig = configPath && fs.existsSync(configPath);

    let mcps = 0;
    if (hasConfig) {
      foundCount++;
      try {
        const config = await adapter.readConfig("user");
        mcps = extractConfiguredMcpIds(config).length;
        mcpTotal += mcps;
      } catch {
        /* read error, skip count */
      }
    }

    const statusIcon = hasConfig ? chalk.green("✓") : chalk.gray("·");
    const mcpStr = mcps > 0 ? chalk.yellow(` ${mcps} MCP(s)`) : "";
    const caps: string[] = [];
    if (adapter.supportsMcp) caps.push("MCP");
    if (adapter.supportsSkills) caps.push("Skills");
    if (adapter.supportsRules) caps.push("Rules");

    console.log(
      `  ${statusIcon} ${chalk.bold(name)}${mcpStr}${caps.length > 0 ? chalk.gray(`  [${caps.join(", ")}]`) : ""}`,
    );
  }

  console.log(chalk.blue("\nSummary:"));
  console.log(chalk.gray(`  ${foundCount}/${ADAPTERS.length} IDEs have config files`));
  console.log(chalk.gray(`  ${mcpTotal} total MCP servers detected`));

  console.log(chalk.blue("\nEnvironment:"));
  console.log(chalk.gray(`  Node: ${process.version}`));
  console.log(chalk.gray(`  OS: ${process.platform}`));
  console.log(chalk.gray(`  CWD: ${projectRoot}`));

  console.log(chalk.cyan("\n✨ Diagnostics complete!"));
}
