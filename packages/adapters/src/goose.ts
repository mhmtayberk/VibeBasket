import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, Scope } from "../../core/src/manifest.js";
import { hasErrorCode, resolveSecretInterpolations } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

interface GooseExtensionConfig {
  name: string;
  enabled: boolean;
  type: "stdio" | "streamable_http";
  timeout: number;
  cmd?: string;
  args?: string[];
  envs?: Record<string, string>;
  url?: string;
}

interface GooseConfig {
  raw: string;
  extensions: Record<string, GooseExtensionConfig>;
}

function parseGooseExtensions(raw: string): Record<string, GooseExtensionConfig> {
  const extensions: Record<string, GooseExtensionConfig> = {};
  const lines = raw.split(/\r?\n/);
  let inExtensions = false;
  let currentName: string | null = null;

  for (const line of lines) {
    const indent = line.match(/^ */)?.[0].length ?? 0;
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (indent === 0) {
      inExtensions = trimmed === "extensions:";
      currentName = null;
      continue;
    }

    if (!inExtensions) {
      continue;
    }

    if (indent === 2 && trimmed.endsWith(":")) {
      currentName = trimmed.slice(0, -1);
      extensions[currentName] = {
        name: currentName,
        enabled: true,
        timeout: 300,
        type: "stdio",
      };
      continue;
    }

    if (!currentName || indent < 4) {
      continue;
    }

    const current = extensions[currentName];
    if (!current) {
      continue;
    }

    if (trimmed.startsWith("name:")) {
      current.name = trimmed.slice(5).trim().replace(/^"|"$/g, "");
    } else if (trimmed.startsWith("enabled:")) {
      current.enabled = trimmed.slice(8).trim() === "true";
    } else if (trimmed.startsWith("type:")) {
      const typeValue = trimmed.slice(5).trim().replace(/^"|"$/g, "");
      current.type = typeValue === "streamable_http" ? "streamable_http" : "stdio";
    } else if (trimmed.startsWith("timeout:")) {
      current.timeout = Number(trimmed.slice(8).trim()) || 300;
    } else if (trimmed.startsWith("cmd:")) {
      current.cmd = trimmed.slice(4).trim().replace(/^"|"$/g, "");
    } else if (trimmed.startsWith("url:")) {
      current.url = trimmed.slice(4).trim().replace(/^"|"$/g, "");
    } else if (trimmed.startsWith("args:")) {
      const argsValue = trimmed.slice(5).trim();
      current.args =
        argsValue.startsWith("[") && argsValue.endsWith("]")
          ? argsValue
              .slice(1, -1)
              .split(",")
              .map((value) => value.trim().replace(/^"|"$/g, ""))
              .filter(Boolean)
          : [];
    }
  }

  return extensions;
}

function renderGooseExtensions(extensions: Record<string, GooseExtensionConfig>): string {
  const names = Object.keys(extensions).sort();
  if (names.length === 0) {
    return "extensions: {}\n";
  }

  let output = "extensions:\n";

  for (const name of names) {
    const extension = extensions[name];
    if (!extension) {
      continue;
    }

    output += `  ${name}:\n`;
    output += `    name: ${extension.name}\n`;
    output += `    enabled: ${extension.enabled ? "true" : "false"}\n`;
    output += `    type: ${extension.type}\n`;
    output += `    timeout: ${extension.timeout}\n`;

    if (extension.cmd) {
      output += `    cmd: ${extension.cmd}\n`;
    }
    if (extension.args && extension.args.length > 0) {
      output += `    args: [${extension.args.map((value) => `"${value}"`).join(", ")}]\n`;
    }
    if (extension.url) {
      output += `    url: ${extension.url}\n`;
    }
    if (extension.envs && Object.keys(extension.envs).length > 0) {
      output += "    envs:\n";
      for (const [envKey, envValue] of Object.entries(extension.envs)) {
        output += `      ${envKey}: "${envValue.replace(/"/g, '\\"')}"\n`;
      }
    }
  }

  return output;
}

function replaceManagedExtensions(
  raw: string,
  extensions: Record<string, GooseExtensionConfig>,
): string {
  const lines = raw.split(/\r?\n/);
  const rendered = renderGooseExtensions(extensions).trimEnd();
  const output: string[] = [];
  let inExtensions = false;

  for (const line of lines) {
    const indent = line.match(/^ */)?.[0].length ?? 0;
    const trimmed = line.trim();

    if (indent === 0 && trimmed === "extensions:") {
      if (!inExtensions) {
        output.push(rendered);
      }
      inExtensions = true;
      continue;
    }

    if (inExtensions) {
      if (indent === 0 && trimmed) {
        inExtensions = false;
        output.push(line);
      }
      continue;
    }

    output.push(line);
  }

  if (!raw.includes("extensions:")) {
    const normalized = output.join("\n").trimEnd();
    return `${normalized}${normalized ? "\n\n" : ""}${rendered}\n`;
  }

  return `${output.join("\n").trimEnd()}\n`;
}

export class GooseAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("goose");
  readonly id: IdeId = "goose";
  readonly displayName = "Goose";
  readonly supportsMcp = GooseAdapter.capabilities.supportsMcp;
  readonly supportsSkills = GooseAdapter.capabilities.supportsSkills;
  readonly supportsRules = GooseAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = GooseAdapter.capabilities.supportedScopes;

  configPath(): string {
    if (os.platform() === "win32") {
      return path.join(
        process.env.APPDATA?.trim() || path.join(os.homedir(), "AppData", "Roaming"),
        "Block",
        "goose",
        "config",
        "config.yaml",
      );
    }

    return path.join(
      process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config"),
      "goose",
      "config.yaml",
    );
  }

  async readConfig(): Promise<unknown> {
    const file = this.configPath();
    try {
      const raw = await fs.readFile(file, "utf8");
      return {
        raw,
        extensions: parseGooseExtensions(raw),
      } satisfies GooseConfig;
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { raw: "", extensions: {} } satisfies GooseConfig;
      }
      throw error;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as GooseConfig) || { raw: "", extensions: {} };
    const nextExtensions = { ...(current.extensions || {}) };

    for (const mcp of mcps) {
      if (nextExtensions[mcp.id] && !opts.force) {
        continue;
      }

      if (mcp.runtime === "remote") {
        nextExtensions[mcp.id] = {
          name: mcp.displayName,
          enabled: true,
          type: "streamable_http",
          timeout: 300,
          ...(mcp.url ? { url: mcp.url } : {}),
        };
        continue;
      }

      nextExtensions[mcp.id] = {
        name: mcp.displayName,
        enabled: true,
        type: "stdio",
        timeout: 300,
        cmd: mcp.command || mcp.runtime,
        ...(mcp.args?.length ? { args: mcp.args } : {}),
        ...(Object.keys(resolveSecretInterpolations(mcp.env, secrets)).length > 0
          ? { envs: resolveSecretInterpolations(mcp.env, secrets) }
          : {}),
      };
    }

    return {
      raw: current.raw || "",
      extensions: nextExtensions,
    } satisfies GooseConfig;
  }

  async writeConfig(_scope: Scope, config: unknown): Promise<void> {
    const file = this.configPath();
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    const current = (config as GooseConfig) || { raw: "", extensions: {} };
    const rendered = replaceManagedExtensions(current.raw || "", current.extensions || {});
    await fs.writeFile(file, rendered, "utf8");
  }

  async diff(_scope: Scope, pending: unknown): Promise<string> {
    const current = (pending as GooseConfig) || { raw: "", extensions: {} };
    return replaceManagedExtensions(current.raw || "", current.extensions || {});
  }

  postInstallHint(): string {
    return "Restart Goose or rerun `goose configure` to verify the extension list has reloaded.";
  }
}
