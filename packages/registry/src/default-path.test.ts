import { describe, expect, it } from "vitest";
import { RegistrySyncService } from "./index";

describe("RegistrySyncService default paths", () => {
  it("resolves the verified catalog relative to the registry package, not process.cwd()", () => {
    const originalCwd = process.cwd();
    try {
      process.chdir("/Users/ayberk/Desktop/AI Projects/VibeBasket/apps/web");
      const service = new RegistrySyncService({ persist: false });
      const serviceWithInternals = service as unknown as { verifiedPath: string };

      expect(serviceWithInternals.verifiedPath).toBe(
        "/Users/ayberk/Desktop/AI Projects/VibeBasket/packages/registry/data/verified.yaml",
      );
    } finally {
      process.chdir(originalCwd);
    }
  });
});
