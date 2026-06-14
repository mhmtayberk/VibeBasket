import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { verifiedCatalogSchema } from "../schemas";
import type { SourceCollectedItem, SourceCollector } from "../schemas";
import {
  buildMcpCatalogItem,
  buildRuleCatalogItem,
  buildSkillCatalogItem,
  buildWorkflowCatalogItem,
  canonicalMcpKey,
  canonicalSkillKey,
} from "../utils";

const require = createRequire(import.meta.url);
const { load: parseYaml } = require("js-yaml") as {
  load: (input: string) => unknown;
};

export class VerifiedCatalogCollector implements SourceCollector {
  readonly name = "verified-catalog";

  constructor(private readonly verifiedPath: string) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const raw = await fs.readFile(this.verifiedPath, "utf8");
    const parsed = verifiedCatalogSchema.parse(parseYaml(raw));

    const items: SourceCollectedItem[] = [];

    for (const mcp of parsed.mcps) {
      items.push({
        canonicalKey: canonicalMcpKey(mcp),
        sourceName: this.name,
        catalogItem: buildMcpCatalogItem(mcp, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const skill of parsed.skills) {
      items.push({
        canonicalKey: canonicalSkillKey(skill),
        sourceName: this.name,
        catalogItem: buildSkillCatalogItem(skill, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const rule of parsed.rules ?? []) {
      items.push({
        canonicalKey: `rule:${rule.id}`,
        sourceName: this.name,
        catalogItem: buildRuleCatalogItem(rule, {
          verified: true,
          sourceName: this.name,
        }),
      });
    }

    for (const workflow of parsed.workflowPacks) {
      items.push({
        canonicalKey: `workflow:${workflow.id}`,
        sourceName: this.name,
        catalogItem: buildWorkflowCatalogItem(workflow, {
          verified: true,
          sourceName: this.name,
        }),
      });

      for (const rule of workflow.rules) {
        items.push({
          canonicalKey: `rule:${rule.id}`,
          sourceName: this.name,
          catalogItem: buildRuleCatalogItem(rule, {
            verified: true,
            sourceName: this.name,
          }),
        });
      }
    }

    return items;
  }
}
