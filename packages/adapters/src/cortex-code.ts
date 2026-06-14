import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";
export class CortexCodeAdapter extends BaseAdapter {
  readonly id = "cortex-code" as const;
  readonly displayName = "Cortex Code";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project" && projectRoot)
      return path.join(projectRoot, ".snowflake", "cortex", "mcp.json");
    return path.join(os.homedir(), ".snowflake", "cortex", "mcp.json");
  }
  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const skillsDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".cortex", "skills")
        : path.join(os.homedir(), ".snowflake", "cortex", "skills");
    await fs.mkdir(skillsDir, { recursive: true });
    for (const skill of skills) {
      const content =
        skill.source.type === "inline"
          ? skill.source.content
          : `# ${skill.displayName}\nSource: ${skill.source.type === "github" ? `github.com/${skill.source.repo}` : `npm: ${skill.source.type === "npm" ? skill.source.package : "inline"}`}`;
      await fs.writeFile(
        path.join(skillsDir, `${skill.id}.md`),
        `# ${skill.displayName}\n\n${content}`,
        "utf8",
      );
    }
  }
  postInstallHint(): string {
    return "Restart Cortex Code or reload the terminal session.";
  }
}
