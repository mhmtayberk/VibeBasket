import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";

export class GeminiCliAdapter extends BaseAdapter {
  readonly id = "gemini-cli" as const;
  readonly displayName = "Gemini CLI";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".gemini", "settings.json");
    }

    return path.join(os.homedir(), ".gemini", "settings.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".gemini", "skills")
        : path.join(os.homedir(), ".gemini", "skills");

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
    return "Restart Gemini CLI or reload the session for MCP and skill changes to take effect.";
  }
}
