import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import {
  appendManagedContentResult,
  createManagedContentResult,
  matchesManagedContent,
  upsertManagedTextFile,
} from "./managed-installs";
import { mergeStandardMcpServers } from "./mcp-utils";
import { getWindowsRoamingDir, getXdgConfigHome } from "./platform-paths";

interface ZedConfig {
  context_servers?: Record<
    string,
    {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      type?: string;
    }
  >;
}

export class ZedAdapter extends BaseAdapter {
  readonly id = "zed" as const;
  readonly displayName = "Zed";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".zed", "settings.json");
    }
    const platform = os.platform();
    if (platform === "darwin") return path.join(getXdgConfigHome(), "zed", "settings.json");
    if (platform === "win32") return path.join(getWindowsRoamingDir(), "Zed", "settings.json");
    return path.join(getXdgConfigHome(), "zed", "settings.json");
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as ZedConfig) || { context_servers: {} };
    return {
      ...current,
      context_servers: mergeStandardMcpServers(current.context_servers || {}, mcps, secrets, opts),
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".agents", "skills")
        : path.join(os.homedir(), ".agents", "skills");

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
    return "Restart Zed for context server and skill changes to take effect.";
  }
}
