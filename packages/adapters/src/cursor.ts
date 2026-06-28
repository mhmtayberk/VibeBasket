import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import {
  appendManagedContentResult,
  createManagedContentResult,
  matchesManagedContent,
  upsertManagedTextFile,
} from "./managed-installs";

export class CursorAdapter extends BaseAdapter {
  readonly id = "cursor" as const;
  readonly displayName = "Cursor";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".cursor", "mcp.json");
    }
    return path.join(os.homedir(), ".cursor", "mcp.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".cursor", "skills")
        : path.join(os.homedir(), ".cursor", "skills");

    await fs.mkdir(baseDir, { recursive: true });

    const result = createManagedContentResult();

    for (const skill of skills) {
      const skillDir = path.join(baseDir, skill.id);

      const body =
        skill.source.type === "inline"
          ? skill.source.content
          : skill.source.type === "github"
            ? `Source: GitHub - ${skill.source.repo} (path: ${skill.source.path || "/"})`
            : `Source: npm - ${skill.source.package}`;

      const content = `---\nname: ${skill.id}\ndescription: ${skill.displayName}\n---\n\n${body}\n`;
      const targetFile = path.join(skillDir, "SKILL.md");
      const writeResult = await upsertManagedTextFile({
        registryDir: baseDir,
        targetFile,
        kind: "skill",
        id: skill.id,
        content,
        isLegacyManagedContent: (currentContent) =>
          matchesManagedContent(currentContent, content, [skill.displayName, `name: ${skill.id}`]),
      });
      appendManagedContentResult(result, writeResult);
    }

    return result;
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".cursor", "rules")
        : path.join(os.homedir(), ".cursor", "rules");
    await fs.mkdir(baseDir, { recursive: true });
    const result = createManagedContentResult();
    for (const rule of rules) {
      const content = `# ${rule.displayName}\n\n${rule.content}`;
      const writeResult = await upsertManagedTextFile({
        registryDir: baseDir,
        targetFile: path.join(baseDir, `${rule.id}.md`),
        kind: "rule",
        id: rule.id,
        content,
        isLegacyManagedContent: (currentContent) =>
          matchesManagedContent(currentContent, content, [rule.displayName]),
      });
      appendManagedContentResult(result, writeResult);
    }
    return result;
  }

  postInstallHint(): string {
    return "Restart Cursor or reload the window for MCP changes to take effect.";
  }
}
