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

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".kiro", "skills")
        : path.join(os.homedir(), ".kiro", "skills");

    await fs.mkdir(baseDir, { recursive: true });

    const result = createManagedContentResult();

    for (const skill of skills) {
      const skillDir = path.join(baseDir, skill.id);

      const body =
        skill.source.type === "inline"
          ? skill.source.content
          : skill.source.type === "github"
            ? `Source: github.com/${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}`
            : `Source: npm ${skill.source.package}`;

      const content = `---\nname: ${skill.displayName}\ndescription: Installed by VibeBasket\n---\n\n${body}\n`;
      appendManagedContentResult(
        result,
        await upsertManagedTextFile({
          registryDir: baseDir,
          targetFile: path.join(skillDir, "SKILL.md"),
          kind: "skill",
          id: skill.id,
          content,
          isLegacyManagedContent: (currentContent) =>
            matchesManagedContent(currentContent, content, ["Installed by VibeBasket"]),
        }),
      );
    }

    return result;
  }

  postInstallHint(): string {
    return "Restart Kiro or reload MCP settings and skills before the next task.";
  }
}
