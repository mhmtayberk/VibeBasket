import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { CursorAdapter } from "./cursor.js";
import { VSCodeAdapter } from "./vscode.js";
import { WindsurfAdapter } from "./windsurf.js";
import { AntigravityAdapter } from "./antigravity.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { GeminiCliAdapter } from "./gemini-cli.js";
import { KiroAdapter } from "./kiro.js";
import { JunieAdapter } from "./junie.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { ZedAdapter } from "./zed.js";
import { CodexAdapter } from "./codex.js";

const adapters = [
  new CursorAdapter(),
  new VSCodeAdapter(),
  new WindsurfAdapter(),
  new AntigravityAdapter(),
  new ClaudeCodeAdapter(),
  new GeminiCliAdapter(),
  new KiroAdapter(),
  new JunieAdapter(),
  new ClineCliAdapter(),
  new ZedAdapter(),
  new CodexAdapter(),
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
