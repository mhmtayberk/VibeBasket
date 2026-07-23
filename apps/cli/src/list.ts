import fs from "node:fs";
import type { IdeAdapter } from "@vibebasket/adapters";
import chalk from "chalk";
import type { IdeId } from "../../../packages/core/src/manifest.js";
import {
  extractConfiguredMcpIds,
  resolveRuleInventoryTargets,
  resolveSkillInventoryTargets,
} from "./config-inspection.js";
import { getAllAdapters } from "./runtime/adapters.js";

function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function listDirectoryEntries(dir: string, fileExtension?: string): string[] {
  if (!fileExists(dir)) return [];
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (fileExtension) {
        if (!entry.isFile() || !entry.name.endsWith(fileExtension)) return [];
        return [entry.name.slice(0, -fileExtension.length)];
      }

      if (!entry.isDirectory()) return [];
      return [entry.name];
    });
  } catch {
    return [];
  }
}

function listMarkerEntries(filePath: string): string[] {
  if (!fileExists(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const matches = Array.from(
      content.matchAll(/vibebasket:([a-z0-9-]+)/gi),
      (match) => match[1] ?? "",
    );
    return matches.filter(Boolean);
  } catch {
    return [];
  }
}

function listInventory(targets: ReturnType<typeof resolveSkillInventoryTargets>): string[] {
  const names = targets.flatMap((target) =>
    target.kind === "marker-file"
      ? listMarkerEntries(target.path)
      : listDirectoryEntries(target.path, target.fileExtension),
  );
  return [...new Set(names)];
}

export async function runList() {
  console.log(chalk.bold("\n📋 Installed IDE Configurations\n"));
  const projectRoot = process.cwd();

  for (const [targetId, adapter] of getAllAdapters()) {
    let hasContent = false;
    const lines: string[] = [];
    lines.push(chalk.bold.cyan(`${adapter.displayName} (${targetId})`));

    if (adapter.supportsMcp) {
      let mcps: string[] = [];
      try {
        const config = await adapter.readConfig("user");
        mcps = extractConfiguredMcpIds(config);
      } catch {
        mcps = [];
      }
      if (mcps.length > 0) {
        hasContent = true;
        lines.push(`  MCP Servers (${mcps.length}): ${mcps.map((m) => chalk.green(m)).join(", ")}`);
      } else {
        lines.push(`  MCP Servers: ${chalk.gray("none")}`);
      }
    }

    const ideId = targetId as IdeId;

    if (adapter.supportsSkills) {
      const skills = [
        ...listInventory(resolveSkillInventoryTargets(ideId, "user")),
        ...listInventory(resolveSkillInventoryTargets(ideId, "project", projectRoot)),
      ];
      const unique = [...new Set(skills)];
      if (unique.length > 0) {
        hasContent = true;
        lines.push(`  Skills (${unique.length}): ${unique.map((s) => chalk.yellow(s)).join(", ")}`);
      } else {
        lines.push(`  Skills: ${chalk.gray("none")}`);
      }
    }

    if (adapter.supportsRules) {
      const rules = [
        ...listInventory(resolveRuleInventoryTargets(ideId, "user")),
        ...listInventory(resolveRuleInventoryTargets(ideId, "project", projectRoot)),
      ];
      const unique = [...new Set(rules)];
      if (unique.length > 0) {
        hasContent = true;
        lines.push(`  Rules (${unique.length}): ${unique.map((r) => chalk.magenta(r)).join(", ")}`);
      } else {
        lines.push(`  Rules: ${chalk.gray("none")}`);
      }
    }

    if (!hasContent) {
      lines.push(`  ${chalk.gray("No VibeBasket-managed content found.")}`);
    }

    console.log(lines.join("\n"));
    console.log();
  }
}
