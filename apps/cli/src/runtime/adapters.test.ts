import path from "node:path";
import { SUPPORTED_TARGET_IDS, TARGET_CAPABILITIES } from "@vibebasket/adapters";
import { describe, expect, it } from "vitest";
import { ADAPTERS } from "./adapters";

describe("adapter registry contracts", () => {
  it("registers every supported target exactly once", () => {
    expect(new Set(Object.keys(ADAPTERS))).toEqual(new Set(SUPPORTED_TARGET_IDS));
  });

  it("keeps runtime adapters aligned with declared capabilities and absolute config paths", () => {
    const projectRoot = path.resolve("/tmp/vibebasket-adapter-contract");

    for (const targetId of SUPPORTED_TARGET_IDS) {
      const adapter = ADAPTERS[targetId];
      const capabilities = TARGET_CAPABILITIES[targetId];

      expect(adapter.id).toBe(targetId);
      expect(adapter.supportsMcp).toBe(capabilities.supportsMcp);
      expect(adapter.supportsSkills).toBe(capabilities.supportsSkills);
      expect(adapter.supportsRules).toBe(capabilities.supportsRules);
      expect(adapter.supportedScopes).toEqual(capabilities.supportedScopes);
      if (capabilities.supportsSkills) {
        expect(adapter.applySkills, `${targetId} must implement skill installation`).toBeTypeOf(
          "function",
        );
      }
      if (capabilities.supportsRules) {
        expect(adapter.applyRules, `${targetId} must implement rule installation`).toBeTypeOf(
          "function",
        );
      }

      for (const scope of capabilities.supportedScopes) {
        expect(path.isAbsolute(adapter.configPath(scope, projectRoot))).toBe(true);
      }
    }
  });
});
