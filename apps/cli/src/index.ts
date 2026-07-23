#!/usr/bin/env node

import { createRequire } from "node:module";
import chalk from "chalk";
import { Command } from "commander";
import { toErrorMessage } from "./errors.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };

const program = new Command();

async function runCommand(loader: () => Promise<() => Promise<void>>) {
  try {
    const command = await loader();
    await command();
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${toErrorMessage(error)}`));
    process.exit(1);
  }
}

program
  .name("vibebasket")
  .description("Bundle and apply trusted AI dev setups.")
  .version(packageJson.version ?? "0.0.0");

program
  .command("apply")
  .description("Apply a VibeBasket bundle to your IDEs")
  .argument("<url|file>", "Bundle URL or local JSON file")
  .option("-s, --scope <scope>", "Override scope (user or project)")
  .option("-f, --force", "Skip the trust prompt and allow overwriting existing MCP ids")
  .option("-d, --dry-run", "Preview changes without applying")
  .option("--no-verify", "Skip post-install verification checks")
  .action((input, options) =>
    runCommand(async () => {
      const { applyBundle } = await import("./apply.js");
      return () => applyBundle(input, options);
    }),
  );

program
  .command("init")
  .description("Initialize a new VibeBasket project structure")
  .action(() =>
    runCommand(async () => {
      const { initProject } = await import("./init.js");
      return () => initProject();
    }),
  );

program
  .command("doctor")
  .description("Check your IDE installations and common issues")
  .action(() =>
    runCommand(async () => {
      const { runDoctor } = await import("./doctor.js");
      return () => runDoctor();
    }),
  );

program
  .command("rollback")
  .description("Restore a previous IDE configuration backup")
  .action(() =>
    runCommand(async () => {
      const { runRollback } = await import("./rollback.js");
      return () => runRollback();
    }),
  );

program
  .command("list")
  .description("List installed MCP servers, skills, and rules per IDE")
  .action(() =>
    runCommand(async () => {
      const { runList } = await import("./list.js");
      return () => runList();
    }),
  );

program
  .command("search <query>")
  .description("Search the VibeBasket catalog from the terminal")
  .action((query: string) =>
    runCommand(async () => {
      const { runSearch } = await import("./search.js");
      return () => runSearch(query);
    }),
  );

program
  .command("mcp")
  .description("Run the local VibeBasket MCP server")
  .command("serve")
  .description("Serve VibeBasket tools over stdio for AI IDE integrations")
  .action(() =>
    runCommand(async () => {
      const { serveMcp } = await import("./mcp/index.js");
      return () => serveMcp();
    }),
  );

program.parse();
