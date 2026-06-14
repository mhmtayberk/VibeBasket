import { argv, exit } from "node:process";

const dryRun = argv.includes("--dry-run");
const trigger = dryRun ? "manual-dry-run" : "manual";

try {
  const { RegistrySyncService } = await import("../packages/registry/dist/index.js");
  const startedAt = Date.now();
  const summary = await new RegistrySyncService({
    persist: !dryRun,
    trigger,
  }).syncAll();

  console.log(
    JSON.stringify(
      {
        dryRun,
        durationMs: Date.now() - startedAt,
        summary,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  exit(1);
}
