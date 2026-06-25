import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
export class CodeBuddyAdapter extends BaseAdapter {
  readonly id = "codebuddy" as const;
  readonly displayName = "CodeBuddy";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project" && projectRoot) return path.join(projectRoot, ".mcp.json");
    return path.join(os.homedir(), ".codebuddy", ".mcp.json");
  }
  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const skillsDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".codebuddy", "skills")
        : path.join(os.homedir(), ".codebuddy", "skills");
    await fs.mkdir(skillsDir, { recursive: true });
    for (const skill of skills) {
      const content =
        skill.source.type === "inline"
          ? skill.source.content
          : `Source: ${skill.source.type === "github" ? `github.com/${skill.source.repo}` : "npm"}`;
      await fs.writeFile(
        path.join(skillsDir, `${skill.id}.md`),
        `# ${skill.displayName}\n\n${content}`,
        "utf8",
      );
    }
  }
  postInstallHint(): string {
    return "Restart CodeBuddy or reload the window for MCP changes to take effect.";
  }
}
