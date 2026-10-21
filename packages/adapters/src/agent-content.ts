import fs from "node:fs/promises";
import path from "node:path";
import type { RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import {
  appendManagedContentResult,
  createManagedContentResult,
  matchesManagedContent,
  upsertManagedTextFile,
} from "./managed-installs";

function renderSkillBody(skill: SkillEntry): string {
  if (skill.source.type === "inline") return skill.source.content;
  if (skill.source.type === "github") {
    const suffix = skill.source.path ? `/${skill.source.path}` : "";
    const ref = skill.source.ref ? ` at ${skill.source.ref}` : "";
    return `Source: GitHub - ${skill.source.repo}${suffix}${ref}`;
  }
  return `Source: npm - ${skill.source.package}@${skill.source.version}`;
}

export async function applyAgentSkills(skills: SkillEntry[], baseDir: string) {
  await fs.mkdir(baseDir, { recursive: true });
  const result = createManagedContentResult();

  for (const skill of skills) {
    const content = `---\nname: ${skill.id}\ndescription: ${JSON.stringify(skill.displayName)}\n---\n\n${renderSkillBody(skill)}\n`;
    appendManagedContentResult(
      result,
      await upsertManagedTextFile({
        registryDir: baseDir,
        targetFile: path.join(baseDir, skill.id, "SKILL.md"),
        kind: "skill",
        id: skill.id,
        content,
        isLegacyManagedContent: (currentContent) =>
          matchesManagedContent(currentContent, content, [
            `name: ${skill.id}`,
            `name: "${skill.id}"`,
          ]),
      }),
    );
  }

  return result;
}

export async function applyAlwaysRules(rules: RuleEntry[], baseDir: string) {
  await fs.mkdir(baseDir, { recursive: true });
  const result = createManagedContentResult();

  for (const rule of rules) {
    const content = `---\nalwaysApply: true\n---\n\n# ${rule.displayName}\n\n${rule.content.trim()}\n`;
    appendManagedContentResult(
      result,
      await upsertManagedTextFile({
        registryDir: baseDir,
        targetFile: path.join(baseDir, `${rule.id}.md`),
        kind: "rule",
        id: rule.id,
        content,
        isLegacyManagedContent: (currentContent) =>
          matchesManagedContent(currentContent, content, [rule.displayName]),
      }),
    );
  }

  return result;
}
