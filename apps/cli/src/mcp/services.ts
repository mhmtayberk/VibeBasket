import { randomUUID } from "node:crypto";
import { CatalogApiClient } from "../services/catalog-api.js";
import { createBundleFromSelection, loadBundleFromInput } from "../services/bundle-service.js";
import { executeBundleApply } from "../services/apply-service.js";
import {
  createLocalStackId,
  getLocalStack,
  getLocalStacksState,
  listLocalStacks,
  saveLocalStack,
} from "../services/local-stacks.js";
import { getApiBaseUrl } from "../services/api-base-url.js";
import { listBackups } from "../backup.js";
import { getWritePolicyMode } from "./policy.js";
import type { SelectionInput } from "./types.js";
import {
  getTargetMcpSnippet,
  getTargetSetupGuide,
  listTargetGuides,
} from "../services/target-guidance.js";
import type { IdeId, Scope } from "../../../../packages/core/src/manifest.js";

export class VibebasketMcpServices {
  readonly sessionId = randomUUID();
  readonly catalog = new CatalogApiClient();

  async getSessionState() {
    const localStacks = getLocalStacksState();
    return {
      sessionId: this.sessionId,
      apiBaseUrl: getApiBaseUrl(),
      writePolicyMode: getWritePolicyMode(),
      localStacks,
      cloudStacks: {
        available: false,
        reason:
          "Cloud stack save is not linked in the local MCP yet. Use local stacks here or use the VibeBasket website for profile-backed saved stacks.",
      },
      authentication: {
        cloudSaveLinked: false,
        guidance:
          "Sign into the VibeBasket website when you need profile-backed saved stacks. Local MCP currently supports local stack save only.",
      },
      localMcp: {
        command: "npx",
        args: ["-y", "vibebasket", "mcp", "serve"],
      },
    };
  }

  listTargets() {
    return listTargetGuides();
  }

  getTargetSetupGuide(targetId: IdeId, scope?: Scope) {
    return getTargetSetupGuide(targetId, scope);
  }

  getTargetMcpSnippet(targetId: IdeId, scope?: Scope) {
    return getTargetMcpSnippet(targetId, scope);
  }

  async planInstall(input: SelectionInput) {
    const { bundle, url } = await createBundleFromSelection({
      itemIds: input.itemIds,
      targetIds: input.targetIds,
      scope: input.scope,
    });

    const result = await executeBundleApply(bundle, {
      scope: input.scope,
      force: false,
      dryRun: true,
      verify: false,
      projectRoot: input.scope === "project" ? process.cwd() : undefined,
      interactiveSecrets: false,
    });

    return { bundle, bundleUrl: url, result };
  }

  async applyInstall(input: { bundleUrl?: string; selection?: SelectionInput; force?: boolean }) {
    const bundle =
      input.bundleUrl != null
        ? await loadBundleFromInput(input.bundleUrl)
        : (await createBundleFromSelection({
            itemIds: input.selection!.itemIds,
            targetIds: input.selection!.targetIds,
            scope: input.selection!.scope,
          })).bundle;

    return executeBundleApply(bundle, {
      scope: input.selection?.scope ?? bundle.scope,
      force: input.force ?? false,
      dryRun: false,
      verify: true,
      projectRoot: (input.selection?.scope ?? bundle.scope) === "project" ? process.cwd() : undefined,
      interactiveSecrets: false,
    });
  }

  async saveLocalStack(input: SelectionInput) {
    const snapshots = (
      await Promise.all(input.itemIds.map((itemId) => this.catalog.getItem(itemId)))
    )
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => ({
        id: item.id,
        type: item.type,
        displayName: item.displayName,
        description: item.description ?? null,
      }));

    const stack = saveLocalStack({
      id: createLocalStackId(input.name ?? "stack"),
      name: input.name ?? "Untitled stack",
      description: input.description,
      scope: input.scope,
      targetIds: input.targetIds,
      itemIds: input.itemIds,
      snapshots,
    });

    return stack;
  }

  async loadLocalStack(stackId: string) {
    return getLocalStack(stackId);
  }

  async listLocalStacks() {
    return listLocalStacks();
  }

  async listBackups() {
    return listBackups();
  }
}
