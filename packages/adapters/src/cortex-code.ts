import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import {
  appendManagedContentResult,
  createManagedContentResult,
  matchesManagedContent,
  upsertManagedTextFile,
} from "./managed-installs";
export class CortexCodeAdapter extends BaseAdapter {
  readonly id = "cortex-code" as const;
  readonly displayName = "Cortex Code";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project" && projectRoot)
      return path.join(projectRoot, ".snowflake", "cortex", "mcp.json");
    return path.join(os.homedir(), ".snowflake", "cortex", "mcp.json");
  }
  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const skillsDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".cortex", "skills")
        : path.join(os.homedir(), ".snowflake", "cortex", "skills");
    await fs.mkdir(skillsDir, { recursive: true });
    const result = createManagedContentResult();
    for (const skill of skills) {
      const content =
        skill.source.type === "inline"
          ? skill.source.content
          : `# ${skill.displayName}\nSource: ${skill.source.type === "github" ? `github.com/${skill.source.repo}` : `npm: ${skill.source.type === "npm" ? skill.source.package : "inline"}`}`;
      const rendered = `# ${skill.displayName}\n\n${content}`;
      appendManagedContentResult(
        result,
        await upsertManagedTextFile({
          registryDir: skillsDir,
          targetFile: path.join(skillsDir, `${skill.id}.md`),
          kind: "skill",
          id: skill.id,
          content: rendered,
          isLegacyManagedContent: (currentContent) =>
            matchesManagedContent(currentContent, rendered, [skill.displayName]),
        }),
      );
    }
    return result;
  }
  postInstallHint(): string {
    return "Restart Cortex Code or reload the terminal session.";
  }
}
