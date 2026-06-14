import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";
export class ContinueAdapter extends BaseAdapter {
  readonly id = "continue" as const;
  readonly displayName = "Continue";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".continue", "config.json");
    }
    return path.join(os.homedir(), ".continue", "config.json");
  }
  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const configFile = this.configPath(scope, projectRoot);
    const promptsDir = path.join(path.dirname(configFile), "prompts");
    await fs.mkdir(promptsDir, { recursive: true });
    for (const skill of skills) {
      let promptContent = "";
      if (skill.source.type === "inline") {
        promptContent = skill.source.content;
      } else if (skill.source.type === "github") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from GitHub: \`${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}\` (ref: \`${skill.source.ref || "main"}\`).`;
      } else if (skill.source.type === "npm") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from npm package: \`${skill.source.package}\` (version: \`${skill.source.version || "latest"}\`).`;
      }
      const fileBody = `---\nname: ${skill.displayName}\n---\n\n${promptContent}`;
      await fs.writeFile(path.join(promptsDir, `${skill.id}.prompt`), fileBody, "utf8");
    }
  }
  postInstallHint(): string {
    return "Restart your IDE or reload the window for Continue changes to take effect.";
  }
}
