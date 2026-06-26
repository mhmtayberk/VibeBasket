import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RegistrySyncService } from "./index";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(MODULE_DIR, "../../..");

describe("RegistrySyncService default paths", () => {
  it("resolves the verified catalog relative to the registry package, not process.cwd()", () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(path.join(REPO_ROOT, "apps/web"));
      const service = new RegistrySyncService({ persist: false });
      const serviceWithInternals = service as unknown as { verifiedPath: string };

      expect(serviceWithInternals.verifiedPath).toBe(
        path.join(REPO_ROOT, "packages/registry/data/verified.yaml"),
      );
    } finally {
      process.chdir(originalCwd);
    }
  });
});
