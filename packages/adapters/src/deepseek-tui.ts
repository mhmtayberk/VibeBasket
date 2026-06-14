import os from "node:os";
import path from "node:path";
import { BaseAdapter } from "./base-adapter";
export class DeepSeekTuiAdapter extends BaseAdapter {
  readonly id = "deepseek-tui" as const;
  readonly displayName = "DeepSeek-TUI";
  configPath(): string {
    return path.join(os.homedir(), ".deepseek", "mcp.json");
  }
  postInstallHint(): string {
    return "Restart DeepSeek-TUI or start a fresh session so updated MCP servers are loaded.";
  }
}
