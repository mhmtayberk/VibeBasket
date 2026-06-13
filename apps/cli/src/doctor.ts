import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
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
import type { IdeAdapter } from "@vibebasket/adapters";
import { extractConfiguredMcpIds } from "./config-inspection.js";

const ADAPTERS: [string, IdeAdapter][] = [
  ["Cursor", new CursorAdapter()],
  ["Windsurf", new WindsurfAdapter()],
  ["VS Code / Cline", new VSCodeAdapter()],
  ["Antigravity", new AntigravityAdapter()],
  ["Claude Code", new ClaudeCodeAdapter()],
  ["DeepSeek-TUI", new DeepSeekTuiAdapter()],
  ["Gemini CLI", new GeminiCliAdapter()],
  ["Kiro", new KiroAdapter()],
  ["JetBrains Junie", new JunieAdapter()],
  ["Cline CLI", new ClineCliAdapter()],
  ["Zed", new ZedAdapter()],
  ["Codex CLI", new CodexAdapter()],
  ["Continue", new ContinueAdapter()],
  ["Roo Code", new RooCodeAdapter()],
  ["Hermes", new HermesAdapter()],
  ["OpenClaw", new OpenClawAdapter()],
  ["GitHub Copilot", new GitHubCopilotAdapter()],
  ["Void Editor", new VoidAdapter()],
  ["Aider", new AiderAdapter()],
  ["Cortex Code", new CortexCodeAdapter()],
  ["Goose", new GooseAdapter()],
  ["IBM Bob", new IBMBobAdapter()],
  ["CodeBuddy", new CodeBuddyAdapter()],
  ["OpenCode", new OpenCodeAdapter()],
];

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
