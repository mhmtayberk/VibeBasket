import os from "node:os";
import path from "node:path";
import type { Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";

export const OMP_MCP_SCHEMA_URL =
  "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json";

export class OmpAdapter extends BaseAdapter {
  readonly id = "omp" as const;
  readonly displayName = "OMP (Oh My Pi)";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".omp", "mcp.json");
    }
    const configuredAgentDir = process.env.PI_CODING_AGENT_DIR?.trim();
    return path.join(configuredAgentDir || path.join(os.homedir(), ".omp", "agent"), "mcp.json");
  }

  override async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const current = (await super.readConfig(scope, projectRoot)) as Record<string, unknown>;
    return { $schema: OMP_MCP_SCHEMA_URL, ...current };
  }

  postInstallHint(): string {
    return "Run /mcp in OMP to verify the server, or start a new OMP session.";
  }
}
