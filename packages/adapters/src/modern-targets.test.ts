import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { McpEntry } from "../../core/src/manifest.js";
import { AnteAdapter } from "./ante.js";
import { AutohandAdapter } from "./autohand.js";
import { CrushAdapter } from "./crush.js";
import { OMP_MCP_SCHEMA_URL, OmpAdapter } from "./omp.js";
import { QoderAdapter } from "./qoder.js";
import { TraeAdapter } from "./trae.js";
import { VSCodeAdapter } from "./vscode.js";

const localMcp: McpEntry = {
  id: "ctx7",
  displayName: "Context7",
  runtime: "npx",
  command: "npx",
  args: ["-y", "@upstash/context7-mcp", "it's-safe"],
  env: { TOKEN: "${secret:TOKEN}" },
  headers: {},
  requiredSecrets: ["TOKEN"],
  verified: true,
};

interface StandardConfigResult {
  inputs: unknown[];
  servers: Record<string, { type?: string; command?: string; env?: Record<string, string> }>;
}

interface AnteConfigResult {
  theme: string;
  mcp_servers: Record<string, { env?: Record<string, string> }>;
}

interface AutohandConfigResult {
  theme: string;
  mcp: { enabled: boolean; servers: Array<{ name: string }> };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("2026 target adapters", () => {
  it("writes native VS Code servers while preserving unrelated settings", () => {
    const next = new VSCodeAdapter().applyMcps(
      { inputs: [{ id: "token" }], servers: { existing: { command: "old" } } },
      [localMcp],
      { TOKEN: "resolved" },
      { force: false },
    ) as StandardConfigResult;

    expect(next.inputs).toHaveLength(1);
    expect(next.servers.existing).toBeDefined();
    expect(next.servers.ctx7).toMatchObject({
      type: "stdio",
      command: "npx",
      env: { TOKEN: "resolved" },
    });
  });

  it("uses verified target paths and rejects unsupported Trae user scope", () => {
    expect(new AnteAdapter().configPath()).toBe(path.join(os.homedir(), ".ante", "settings.json"));
    expect(new TraeAdapter().configPath("project", "/tmp/demo")).toBe("/tmp/demo/.trae/mcp.json");
    expect(() => new TraeAdapter().configPath("user")).toThrow(/only supports project/);
    expect(new QoderAdapter().configPath("project", "/tmp/demo")).toBe("/tmp/demo/.mcp.json");
  });

  it("honors OMP and Autohand environment overrides", () => {
    vi.stubEnv("PI_CODING_AGENT_DIR", "/tmp/pi-agent");
    vi.stubEnv("AUTOHAND_HOME", "/tmp/autohand");
    expect(new OmpAdapter().configPath("user")).toBe("/tmp/pi-agent/mcp.json");
    expect(new AutohandAdapter().configPath("user")).toBe("/tmp/autohand/config.json");
    expect(OMP_MCP_SCHEMA_URL).toContain("mcp-schema.json");
  });

  it("honors Qoder, Autohand, and Crush explicit config paths", () => {
    vi.stubEnv("QODER_CONFIG_DIR", "/tmp/qoder-home");
    vi.stubEnv("AUTOHAND_CONFIG", "/tmp/autohand/custom.json");
    vi.stubEnv("CRUSH_GLOBAL_CONFIG", "/tmp/crush/custom-crushrc");

    expect(new QoderAdapter().configPath("user")).toBe("/tmp/qoder-home/settings.json");
    expect(new AutohandAdapter().configPath("user")).toBe("/tmp/autohand/custom.json");
    expect(new AutohandAdapter().configPath("project", "/tmp/demo")).toBe(
      "/tmp/demo/.autohand/config.json",
    );
    expect(new CrushAdapter().configPath("user")).toBe("/tmp/crush/custom-crushrc");
  });

  it("refuses an Autohand non-JSON override instead of corrupting it", () => {
    vi.stubEnv("AUTOHAND_CONFIG", "/tmp/autohand/config.toml");
    expect(() => new AutohandAdapter().configPath("user")).toThrow(/only auto-apply.*JSON/i);
  });

  it("merges Ante and Autohand without replacing unrelated configuration", () => {
    const ante = new AnteAdapter().applyMcps(
      { theme: "dark", mcp_servers: { existing: { command: "old" } } },
      [localMcp],
      { TOKEN: "resolved" },
      { force: false },
    ) as AnteConfigResult;
    expect(ante.theme).toBe("dark");
    expect(ante.mcp_servers.existing).toBeDefined();
    expect(ante.mcp_servers.ctx7).toMatchObject({ env: { TOKEN: "resolved" } });

    const autohand = new AutohandAdapter().applyMcps(
      {
        theme: "dark",
        mcp: { enabled: false, servers: [{ name: "existing", transport: "stdio" }] },
      },
      [localMcp],
      { TOKEN: "resolved" },
      { force: false },
    ) as AutohandConfigResult;
    expect(autohand.theme).toBe("dark");
    expect(autohand.mcp.enabled).toBe(true);
    expect(autohand.mcp.servers.map((server: { name: string }) => server.name)).toEqual([
      "existing",
      "ctx7",
    ]);
  });

  it("creates idempotent, shell-quoted Crush managed blocks", () => {
    const adapter = new CrushAdapter();
    const first = adapter.applyMcps(
      "export KEEP=yes\n",
      [localMcp],
      { TOKEN: "a'b" },
      { force: false },
    );
    const second = adapter.applyMcps(first, [localMcp], { TOKEN: "replacement" }, { force: false });
    expect(second).toBe(first);
    expect(String(first)).toContain("export KEEP=yes");
    expect(String(first)).toContain("# >>> VIBEBASKET MCP START: ctx7 <<<");
    expect(String(first)).toContain(`'it'\"'\"'s-safe'`);
    expect(String(first).match(/VIBEBASKET MCP START/g)).toHaveLength(1);

    const forced = adapter.applyMcps(first, [localMcp], { TOKEN: "replacement" }, { force: true });
    expect(String(forced)).toContain("replacement");
    expect(String(forced)).not.toContain(`'a'\"'\"'b'`);
  });
});
