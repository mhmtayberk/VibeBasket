#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { applyBundle } from "./apply.js";
import { toErrorMessage } from "./errors.js";
import { initProject } from "./init.js";
import { runDoctor } from "./doctor.js";
import { runRollback } from "./rollback.js";

const program = new Command();

program
  .name("vibebasket")
  .description("The Ninite for vibe coding. Bundle and apply AI dev setups.")
  .version("0.1.0");

program
  .command("apply")
  .description("Apply a VibeBasket bundle to your IDEs")
  .argument("<url|file>", "Bundle URL or local JSON file")
  .option("-s, --scope <scope>", "Override scope (user or project)")
  .option("-f, --force", "Apply without trust prompt")
  .option("-d, --dry-run", "Preview changes without applying")
  .action(async (input, options) => {
    try {
      await applyBundle(input, options);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${toErrorMessage(error)}`));
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize a new VibeBasket project structure")
  .action(async () => {
    try {
      await initProject();
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${toErrorMessage(error)}`));
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("Check your IDE installations and common issues")
  .action(async () => {
    try {
      await runDoctor();
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${toErrorMessage(error)}`));
      process.exit(1);
    }
  });

program
  .command("rollback")
  .description("Restore a previous IDE configuration backup")
  .action(async () => {
    try {
      await runRollback();
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${toErrorMessage(error)}`));
      process.exit(1);
    }
  });

program.parse();
