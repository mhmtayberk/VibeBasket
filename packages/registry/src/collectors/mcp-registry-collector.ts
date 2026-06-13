import type { SourceCollectedItem, SourceCollector } from "../schemas";
import type { CatalogSeedItem, McpEntry } from "../schemas";
import {
  McpEntrySchema,
  mcpRegistryResponseSchema,
} from "../schemas";
import type {
  McpRegistryEntry,
  McpRegistryServer,
} from "../schemas";
import {
  buildMcpCatalogItem,
  canonicalMcpKey,
  compareSemver,
  fetchWithTimeout,
  officialMcpId,
  withVersion,
} from "../utils";

export const MCP_REGISTRY_BASE_URL = "https://registry.modelcontextprotocol.io/v0.1";

export class OfficialMcpRegistryCollector implements SourceCollector {
  readonly name = "official-mcp-registry";

  constructor(
    private readonly fetchImpl: typeof fetch,
    private readonly timeoutMs: number,
    private readonly retries: number
  ) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const items: SourceCollectedItem[] = [];
    const bestServers = new Map<string, { item: SourceCollectedItem; version: string }>();
    let cursor: string | undefined;

    do {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) {
        params.set("cursor", cursor);
      }

      const res = await fetchWithTimeout(
        this.fetchImpl,
        `${MCP_REGISTRY_BASE_URL}/servers?${params.toString()}`,
        {
          headers: {
            accept: "application/json",
            "user-agent": "VibeBasket Registry Sync/0.1 (+https://vibebasket.dev)",
          },
        },
        `MCP registry request`,
        {
          timeoutMs: this.timeoutMs,
          retries: this.retries,
        }
      );
      if (!res.ok) {
        throw new Error(`MCP registry request failed: HTTP ${res.status}`);
      }

      const payload = mcpRegistryResponseSchema.parse(await res.json());

      for (const registryEntry of payload.servers) {
        const normalized = this.unwrapRegistryEntry(registryEntry);
        if (!normalized || normalized.status === "deleted") {
          continue;
        }

        const entry = this.normalizeRegistryServer(normalized.server);
        if (!entry) {
          continue;
        }

        const overrides: Partial<CatalogSeedItem> = { verified: false };
        if (normalized.server.description) {
          overrides.description = normalized.server.description;
        }
        overrides.sourceName = this.name;
        overrides.sourceUrl = `${MCP_REGISTRY_BASE_URL}/servers`;

        const packageDefinition = normalized.server.packages?.find((pkg) => pkg.transport?.type === "stdio") ?? normalized.server.packages?.[0];
        const version = packageDefinition?.version ?? "0.0.0";
        const serverKey = normalized.server.name.toLowerCase();

        const collectedItem: SourceCollectedItem = {
          canonicalKey: canonicalMcpKey(entry),
          sourceName: this.name,
          catalogItem: buildMcpCatalogItem(entry, overrides),
        };

        const existing = bestServers.get(serverKey);
        if (!existing || compareSemver(version, existing.version) > 0) {
          bestServers.set(serverKey, { item: collectedItem, version });
        }
      }

      cursor = payload.metadata?.nextCursor;
    } while (cursor);

    for (const val of bestServers.values()) {
      items.push(val.item);
    }

    return items;
  }

  private unwrapRegistryEntry(registryEntry: McpRegistryEntry): {
    server: McpRegistryServer;
    status?: string;
  } {
    if ("server" in registryEntry) {
      const metaRecord = registryEntry._meta as
        | Record<string, { status?: string }>
        | undefined;
      const officialMeta = metaRecord?.["io.modelcontextprotocol.registry/official"];
      return officialMeta?.status
        ? {
            server: registryEntry.server as McpRegistryServer,
            status: officialMeta.status,
          }
        : {
            server: registryEntry.server as McpRegistryServer,
          };
    }

    return registryEntry.status
      ? {
          server: registryEntry,
          status: registryEntry.status,
        }
      : {
          server: registryEntry,
        };
  }

  private normalizeRegistryServer(server: McpRegistryServer) {
    const remoteUrl = server.remotes?.find((remote) => {
      try {
        new URL(remote.url);
        return true;
      } catch {
        return false;
      }
    })?.url;
    const packageDefinition = server.packages?.find((pkg) => pkg.transport?.type === "stdio") ?? server.packages?.[0];
    const displayName = server.title ?? server.name.split("/").pop() ?? server.name;

    const entryBase = {
      catalogRef: `mcp-registry:${server.name}`,
      displayName,
      args: [],
      env: {},
      requiredSecrets: [],
      verified: false,
    };

    if (remoteUrl) {
      const entry = {
        ...entryBase,
        runtime: "remote",
        url: remoteUrl,
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (!packageDefinition?.identifier) {
      return null;
    }

    if (packageDefinition.registryType === "npm") {
      const entry = {
        ...entryBase,
        runtime: "npx",
        args: ["-y", withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (packageDefinition.registryType === "pypi") {
      const entry = {
        ...entryBase,
        runtime: "uvx",
        args: [withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    if (packageDefinition.registryType === "docker") {
      const entry = {
        ...entryBase,
        runtime: "docker",
        args: ["run", "--rm", withVersion(packageDefinition.identifier, packageDefinition.version)],
      } satisfies Omit<McpEntry, "id">;

      return McpEntrySchema.parse({
        ...entry,
        id: officialMcpId(displayName, server.name, entry),
      });
    }

    return null;
  }
}
