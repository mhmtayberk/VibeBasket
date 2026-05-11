import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { CursorAdapter } from "./cursor.js";
import { VSCodeAdapter } from "./vscode.js";
import { WindsurfAdapter } from "./windsurf.js";
import { AntigravityAdapter } from "./antigravity.js";
import type { McpEntry } from "@vibebasket/core";

const adapters = [
  new CursorAdapter(),
  new VSCodeAdapter(),
  new WindsurfAdapter(),
  new AntigravityAdapter(),
];

describe("Adapter Idempotency Law", () => {
  for (const adapter of adapters) {
    it(`${adapter.displayName} should satisfy apply(apply(c, i), i) === apply(c, i)`, () => {
      fc.assert(
        fc.property(
          fc.record({
            mcpServers: fc.dictionary(
              fc.string(),
              fc.record({
                command: fc.string(),
                args: fc.array(fc.string()),
              })
            ),
          }),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }).filter(s => /^[a-z0-9-]+$/.test(s)),
              displayName: fc.string(),
              runtime: fc.constant("npx" as const),
              command: fc.string(),
              args: fc.array(fc.string()),
              env: fc.dictionary(fc.string(), fc.string()),
              requiredSecrets: fc.array(fc.string()),
              verified: fc.boolean(),
            })
          ),
          (config, items) => {
            const firstApply = adapter.applyMcps(config, items as any, {}, { force: false });
            const secondApply = adapter.applyMcps(firstApply, items as any, {}, { force: false });
            
            expect(secondApply).toEqual(firstApply);
          }
        )
      );
    });
  }
});
