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
export class IBMBobAdapter extends BaseAdapter {
  readonly id = "ibm-bob" as const;
  readonly displayName = "IBM Bob";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project" && projectRoot) return path.join(projectRoot, ".bob", "mcp.json");
    return path.join(os.homedir(), ".bob", "mcp_settings.json");
  }
  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const skillsDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".bob", "skills")
        : path.join(os.homedir(), ".bob", "skills");
    await fs.mkdir(skillsDir, { recursive: true });
    const result = createManagedContentResult();
    for (const skill of skills) {
      const content =
        skill.source.type === "inline"
          ? skill.source.content
          : `Source: ${skill.source.type === "github" ? `github.com/${skill.source.repo}` : "npm"}`;
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
    return "Restart IBM Bob or reload the window for MCP changes to take effect.";
  }
}
