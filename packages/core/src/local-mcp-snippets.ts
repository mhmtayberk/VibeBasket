import type { IdeId } from "./manifest";

export type LocalMcpSnippetFormat = "json" | "yaml" | "toml";

export const VIBEBASKET_MCP_SERVER_ID = "vibebasket" as const;
export const VIBEBASKET_LOCAL_MCP_COMMAND = "npx" as const;
export const VIBEBASKET_LOCAL_MCP_ARGS = ["-y", "vibebasket", "mcp", "serve"] as const;
export const VIBEBASKET_LOCAL_MCP_ENV = {
  VIBEBASKET_API_URL: "https://vibebasket.dev",
  VIBEBASKET_MCP_WRITE_POLICY: "confirm",
} as const;

export type LocalMcpSnippet = {
  format: LocalMcpSnippetFormat;
  rootField: string;
  snippet: string;
  mergeStrategyNote: string;
};

export function getBaseVibeBasketServerDefinition() {
  return {
    serverId: VIBEBASKET_MCP_SERVER_ID,
    transport: "stdio" as const,
    command: VIBEBASKET_LOCAL_MCP_COMMAND,
    args: [...VIBEBASKET_LOCAL_MCP_ARGS],
    optionalEnv: { ...VIBEBASKET_LOCAL_MCP_ENV },
  };
}

function renderJsonSnippet(rootKey: string) {
  return JSON.stringify(
    {
      [rootKey]: {
        [VIBEBASKET_MCP_SERVER_ID]: {
          command: VIBEBASKET_LOCAL_MCP_COMMAND,
          args: [...VIBEBASKET_LOCAL_MCP_ARGS],
          env: { ...VIBEBASKET_LOCAL_MCP_ENV },
        },
      },
    },
    null,
    2,
  );
}

function renderContinueYamlSnippet() {
  return [
    "mcpServers:",
    `  - name: ${VIBEBASKET_MCP_SERVER_ID}`,
    `    command: ${VIBEBASKET_LOCAL_MCP_COMMAND}`,
    "    args:",
    ...VIBEBASKET_LOCAL_MCP_ARGS.map((arg) => `      - ${JSON.stringify(arg)}`),
    "    env:",
    ...Object.entries(VIBEBASKET_LOCAL_MCP_ENV).map(
      ([key, value]) => `      ${key}: ${JSON.stringify(value)}`,
    ),
  ].join("\n");
}

function renderCodexTomlSnippet() {
  return [
    `[mcp_servers.${VIBEBASKET_MCP_SERVER_ID}]`,
    `command = ${JSON.stringify(VIBEBASKET_LOCAL_MCP_COMMAND)}`,
    `args = [${VIBEBASKET_LOCAL_MCP_ARGS.map((arg) => JSON.stringify(arg)).join(", ")}]`,
    `env = { ${Object.entries(VIBEBASKET_LOCAL_MCP_ENV)
      .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
      .join(", ")} }`,
  ].join("\n");
}

function renderGooseYamlSnippet() {
  return [
    "extensions:",
    `  ${VIBEBASKET_MCP_SERVER_ID}:`,
    `    name: ${VIBEBASKET_MCP_SERVER_ID}`,
    "    enabled: true",
    "    type: stdio",
    "    timeout: 300",
    `    cmd: ${VIBEBASKET_LOCAL_MCP_COMMAND}`,
    `    args: [${VIBEBASKET_LOCAL_MCP_ARGS.map((arg) => JSON.stringify(arg)).join(", ")}]`,
    "    envs:",
    ...Object.entries(VIBEBASKET_LOCAL_MCP_ENV).map(
      ([key, value]) => `      ${key}: ${JSON.stringify(value)}`,
    ),
  ].join("\n");
}

function renderHermesYamlSnippet() {
  return [
    "mcp_servers:",
    `  ${VIBEBASKET_MCP_SERVER_ID}:`,
    `    command: ${JSON.stringify(VIBEBASKET_LOCAL_MCP_COMMAND)}`,
    "    args:",
    ...VIBEBASKET_LOCAL_MCP_ARGS.map((arg) => `      - ${JSON.stringify(arg)}`),
    "    env:",
    ...Object.entries(VIBEBASKET_LOCAL_MCP_ENV).map(
      ([key, value]) => `      ${key}: ${JSON.stringify(value)}`,
    ),
  ].join("\n");
}

function renderOpenCodeJsonSnippet() {
  return JSON.stringify(
    {
      mcp: {
        [VIBEBASKET_MCP_SERVER_ID]: {
          type: "local",
          enabled: true,
          command: [VIBEBASKET_LOCAL_MCP_COMMAND, ...VIBEBASKET_LOCAL_MCP_ARGS],
          environment: { ...VIBEBASKET_LOCAL_MCP_ENV },
        },
      },
    },
    null,
    2,
  );
}

export function getLocalVibeBasketMcpSnippet(targetId: IdeId): LocalMcpSnippet {
  switch (targetId) {
    case "codex":
      return {
        format: "toml",
        rootField: `mcp_servers.${VIBEBASKET_MCP_SERVER_ID}`,
        snippet: renderCodexTomlSnippet(),
        mergeStrategyNote:
          "Merge this TOML block into the existing config.toml. Do not replace unrelated sections.",
      };
    case "continue":
      return {
        format: "yaml",
        rootField: "mcpServers",
        snippet: renderContinueYamlSnippet(),
        mergeStrategyNote:
          "Merge this list item into the existing top-level mcpServers list. If the file is brand new, keep Continue's required name, version, and schema keys too.",
      };
    case "zed":
      return {
        format: "json",
        rootField: "context_servers",
        snippet: renderJsonSnippet("context_servers"),
        mergeStrategyNote:
          "Merge this fragment into the existing context_servers object and preserve other Zed settings.",
      };
    case "goose":
      return {
        format: "yaml",
        rootField: "extensions",
        snippet: renderGooseYamlSnippet(),
        mergeStrategyNote:
          "Merge this server into the existing extensions block instead of overwriting other Goose extensions.",
      };
    case "hermes":
      return {
        format: "yaml",
        rootField: "mcp_servers",
        snippet: renderHermesYamlSnippet(),
        mergeStrategyNote:
          "Merge this server into the existing mcp_servers block and preserve unrelated Hermes settings.",
      };
    case "opencode":
      return {
        format: "json",
        rootField: "mcp",
        snippet: renderOpenCodeJsonSnippet(),
        mergeStrategyNote:
          "Merge this fragment into the top-level mcp object. Keep existing OpenCode config keys untouched.",
      };
    default:
      return {
        format: "json",
        rootField: "mcpServers",
        snippet: renderJsonSnippet("mcpServers"),
        mergeStrategyNote:
          "Merge this fragment into the existing mcpServers object and preserve unrelated config entries.",
      };
  }
}
