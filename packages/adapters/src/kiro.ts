import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
export class KiroAdapter extends BaseAdapter {
  readonly id = "kiro" as const;
  readonly displayName = "Kiro";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".kiro", "settings", "mcp.json");
    }
    return path.join(os.homedir(), ".kiro", "settings", "mcp.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".kiro", "skills")
        : path.join(os.homedir(), ".kiro", "skills");

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

  postInstallHint(): string {
    return "Restart Kiro or reload MCP settings and skills before the next task.";
  }
}
