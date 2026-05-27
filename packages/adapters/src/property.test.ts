import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { CursorAdapter } from "./cursor.js";
import { VSCodeAdapter } from "./vscode.js";
import { WindsurfAdapter } from "./windsurf.js";
import { AntigravityAdapter } from "./antigravity.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { DeepSeekTuiAdapter } from "./deepseek-tui.js";
import { GeminiCliAdapter } from "./gemini-cli.js";
import { KiroAdapter } from "./kiro.js";
import { JunieAdapter } from "./junie.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { ZedAdapter } from "./zed.js";
import { CodexAdapter } from "./codex.js";
import { ContinueAdapter } from "./continue.js";
import { RooCodeAdapter } from "./roocode.js";
import { HermesAdapter } from "./hermes.js";
import { OpenClawAdapter } from "./openclaw.js";
import { GitHubCopilotAdapter } from "./github-copilot.js";
import { VoidAdapter } from "./void.js";
import { AiderAdapter } from "./aider.js";
import { TARGET_CAPABILITIES } from "./target-capabilities.js";

const adapters = [
  new CursorAdapter(),
  new VSCodeAdapter(),
  new WindsurfAdapter(),
  new AntigravityAdapter(),
  new ClaudeCodeAdapter(),
  new DeepSeekTuiAdapter(),
  new GeminiCliAdapter(),
  new KiroAdapter(),
  new JunieAdapter(),
  new ClineCliAdapter(),
  new ZedAdapter(),
  new CodexAdapter(),
  new ContinueAdapter(),
  new RooCodeAdapter(),
  new HermesAdapter(),
  new OpenClawAdapter(),
  new GitHubCopilotAdapter(),
  new VoidAdapter(),
  new AiderAdapter(),
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

describe("Adapter capability contract", () => {
  for (const adapter of adapters) {
    it(`${adapter.displayName} matches the shared capability registry`, () => {
      expect(adapter.supportsMcp).toBe(TARGET_CAPABILITIES[adapter.id].supportsMcp);
      expect(adapter.supportsSkills).toBe(TARGET_CAPABILITIES[adapter.id].supportsSkills);
      expect(adapter.supportsRules).toBe(TARGET_CAPABILITIES[adapter.id].supportsRules);
      expect(adapter.supportedScopes).toEqual(TARGET_CAPABILITIES[adapter.id].supportedScopes);
    });
  }
});
