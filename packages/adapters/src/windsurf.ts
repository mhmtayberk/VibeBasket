import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { hasErrorCode } from "./mcp-utils";

export class WindsurfAdapter extends BaseAdapter {
  readonly id = "windsurf" as const;
  readonly displayName = "Windsurf";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) {
        throw new Error("projectRoot required for project scope");
      }
      return path.join(projectRoot, ".windsurf", "mcp_config.json");
    }
    return path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".windsurf", "skills")
        : path.join(os.homedir(), ".codeium", "windsurf", "skills");

    await fs.mkdir(baseDir, { recursive: true });

    for (const skill of skills) {
      const skillDir = path.join(baseDir, skill.id);
      await fs.mkdir(skillDir, { recursive: true });

      const body =
        skill.source.type === "inline"
          ? skill.source.content
          : skill.source.type === "github"
            ? `Source: github.com/${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}`
            : `Source: npm ${skill.source.package}`;

      await fs.writeFile(
        path.join(skillDir, "SKILL.md"),
        `---\nname: ${skill.displayName}\ndescription: Installed by VibeBasket\n---\n\n${body}\n`,
        "utf8",
      );
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const rulesDir = path.join(projectRoot, ".devin", "rules");
      await fs.mkdir(rulesDir, { recursive: true });

      for (const rule of rules) {
        await fs.writeFile(
          path.join(rulesDir, `${rule.id}.md`),
          `---\ntrigger: always_on\n---\n\n# ${rule.displayName}\n\n${rule.content}\n`,
          "utf8",
        );
      }
      return;
    }

    const globalRulesFile = path.join(
      os.homedir(),
      ".codeium",
      "windsurf",
      "memories",
      "global_rules.md",
    );
    await fs.mkdir(path.dirname(globalRulesFile), { recursive: true });

    let content = "";
    try {
      content = await fs.readFile(globalRulesFile, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    for (const rule of rules) {
      const startTag = `<!-- VIBEBASKET START: ${rule.id} -->`;
      const endTag = `<!-- VIBEBASKET END: ${rule.id} -->`;
      const nextBlock = `${startTag}\n# ${rule.displayName}\n\n${rule.content}\n${endTag}`;
      const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

      if (pattern.test(content)) {
        content = content.replace(pattern, nextBlock);
      } else {
        content = content.trim() ? `${content.trim()}\n\n${nextBlock}` : nextBlock;
      }
    }

    await fs.writeFile(globalRulesFile, `${content.trim()}\n`, "utf8");
  }

  postInstallHint(): string {
    return "Restart Windsurf or reload the window for MCP, skill, and rule changes to take effect.";
  }
}
