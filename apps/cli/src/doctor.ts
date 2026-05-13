import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { CursorAdapter } from "@vibebasket/adapters";

export async function runDoctor() {
  console.log(chalk.cyan("🧺 VibeBasket: Running diagnostics...\n"));

  const projectRoot = process.cwd();
  
  // 1. Check for Project Structure
  const vbDir = path.join(projectRoot, ".vibebasket");
  if (fs.existsSync(vbDir)) {
    console.log(chalk.green("✔ Project structure (.vibebasket/) found."));
  } else {
    console.log(chalk.yellow("⚠ Project structure (.vibebasket/) not found. Run 'vibebasket init' to set up."));
  }

  // 2. Check for Secrets File
  const envPath = path.join(projectRoot, ".vibebasket.env");
  if (fs.existsSync(envPath)) {
    console.log(chalk.green("✔ .vibebasket.env found."));
  } else {
    console.log(chalk.yellow("⚠ .vibebasket.env not found. Local secrets might be missing."));
  }

  // 3. Check for IDE Configs
  console.log(chalk.blue("\nChecking IDE configurations..."));
  
  const cursorAdapter = new CursorAdapter();
  try {
    const cursorConfig = (await cursorAdapter.readConfig("user")) as any;
    console.log(chalk.green("✔ Cursor configuration found and readable."));
    const mcpCount = Object.keys(cursorConfig.mcpServers || {}).length;
    console.log(chalk.gray(`  - Found ${mcpCount} MCP servers configured.`));
  } catch (err) {
    console.log(chalk.gray("  - Cursor not found or config unreadable."));
  }

  // 4. Environment Check
  console.log(chalk.blue("\nEnvironment Check:"));
  console.log(chalk.gray(`  - Node version: ${process.version}`));
  console.log(chalk.gray(`  - OS: ${process.platform}`));

  console.log(chalk.cyan("\n✨ Diagnostics complete!"));
}
