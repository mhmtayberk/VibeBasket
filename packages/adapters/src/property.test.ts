import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { McpEntry } from "../../core/src/manifest.js";
import { AiderAdapter } from "./aider.js";
import { AntigravityAdapter } from "./antigravity.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { CodeBuddyAdapter } from "./codebuddy.js";
import { CodexAdapter } from "./codex.js";
import { ContinueAdapter } from "./continue.js";
import { CortexCodeAdapter } from "./cortex-code.js";
import { CursorAdapter } from "./cursor.js";
import { DeepSeekTuiAdapter } from "./deepseek-tui.js";
import { GeminiCliAdapter } from "./gemini-cli.js";
import { GitHubCopilotAdapter } from "./github-copilot.js";
import { GooseAdapter } from "./goose.js";
import { HermesAdapter } from "./hermes.js";
import { IBMBobAdapter } from "./ibm-bob.js";
import { JunieAdapter } from "./junie.js";
import { KiroAdapter } from "./kiro.js";
import { OpenClawAdapter } from "./openclaw.js";
import { OpenCodeAdapter } from "./opencode.js";
import { RooCodeAdapter } from "./roocode.js";
import { TARGET_CAPABILITIES } from "./target-capabilities.js";
import { VoidAdapter } from "./void.js";
import { VSCodeAdapter } from "./vscode.js";
import { WindsurfAdapter } from "./windsurf.js";
import { ZedAdapter } from "./zed.js";

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
  new CortexCodeAdapter(),
  new GooseAdapter(),
  new IBMBobAdapter(),
  new CodeBuddyAdapter(),
  new OpenCodeAdapter(),
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
              }),
            ),
          }),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
              displayName: fc.string(),
              runtime: fc.constant("npx" as const),
              command: fc.string(),
              args: fc.array(fc.string()),
              env: fc.dictionary(fc.string(), fc.string()),
              requiredSecrets: fc.array(fc.string()),
              verified: fc.boolean(),
            }),
          ),
          (config, items) => {
            const typedItems = items as McpEntry[];
            const firstApply = adapter.applyMcps(config, typedItems, {}, { force: false });
            const secondApply = adapter.applyMcps(firstApply, typedItems, {}, { force: false });

            expect(secondApply).toEqual(firstApply);
          },
        ),
      );
    });
  }
});

describe("Adapter feature-method contract", () => {
  for (const adapter of adapters) {
    it(`${adapter.displayName} exposes methods for every advertised optional capability`, () => {
      const optionalAdapter = adapter as {
        applySkills?: unknown;
        applyRules?: unknown;
      };
      if (adapter.supportsSkills) {
        expect(typeof optionalAdapter.applySkills).toBe("function");
      }
      if (adapter.supportsRules) {
        expect(typeof optionalAdapter.applyRules).toBe("function");
      }
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
