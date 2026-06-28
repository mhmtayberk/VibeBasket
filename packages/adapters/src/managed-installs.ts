import fs from "node:fs/promises";
import path from "node:path";
import { hasErrorCode } from "./mcp-utils";
import type { ManagedContentApplyOutcome, ManagedContentApplyResult } from "./types";

const MANAGED_REGISTRY_FILE = ".vibebasket-managed.json";

interface ManagedRegistryEntry {
  kind: "skill" | "rule" | "prompt";
  id: string;
  updatedAt: string;
}

interface ManagedRegistry {
  version: 1;
  entries: Record<string, ManagedRegistryEntry>;
}

interface UpsertManagedTextFileOptions {
  registryDir: string;
  targetFile: string;
  kind: ManagedRegistryEntry["kind"];
  id: string;
  content: string;
  isLegacyManagedContent?: (currentContent: string) => boolean;
}

const EMPTY_RESULT: ManagedContentApplyResult = {
  written: [],
  updated: [],
  unchanged: [],
  skipped: [],
};

export function createManagedContentResult(): ManagedContentApplyResult {
  return {
    written: [],
    updated: [],
    unchanged: [],
    skipped: [],
  };
}

export function mergeManagedContentResults(
  ...results: ManagedContentApplyOutcome[]
): ManagedContentApplyResult {
  const merged = createManagedContentResult();

  for (const result of results) {
    if (!result) {
      continue;
    }

    merged.written.push(...result.written);
    merged.updated.push(...result.updated);
    merged.unchanged.push(...result.unchanged);
    merged.skipped.push(...result.skipped);
  }

  return merged;
}

export function appendManagedContentResult(
  target: ManagedContentApplyResult,
  source: ManagedContentApplyOutcome,
): ManagedContentApplyResult {
  if (!source) {
    return target;
  }

  target.written.push(...source.written);
  target.updated.push(...source.updated);
  target.unchanged.push(...source.unchanged);
  target.skipped.push(...source.skipped);
  return target;
}

export async function upsertManagedTextFile(
  options: UpsertManagedTextFileOptions,
): Promise<ManagedContentApplyResult> {
  const registryDir = options.registryDir;
  const targetFile = options.targetFile;
  const relativeTargetPath = normalizeManagedPath(path.relative(registryDir, targetFile));
  const registryPath = path.join(registryDir, MANAGED_REGISTRY_FILE);
  const registry = await readManagedRegistry(registryPath);

  const currentContent = await readFileIfExists(targetFile);
  const managedEntry = registry.entries[relativeTargetPath];

  if (currentContent === null) {
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, options.content, "utf8");
    registry.entries[relativeTargetPath] = {
      kind: options.kind,
      id: options.id,
      updatedAt: new Date().toISOString(),
    };
    await writeManagedRegistry(registryPath, registry);
    return {
      ...EMPTY_RESULT,
      written: [targetFile],
    };
  }

  const ownedByVibeBasket =
    managedEntry?.kind === options.kind &&
    managedEntry.id === options.id &&
    Boolean(options.isLegacyManagedContent?.(currentContent) || managedEntry);

  if (!ownedByVibeBasket) {
    const legacyManaged = options.isLegacyManagedContent?.(currentContent) ?? false;

    if (!legacyManaged) {
      return {
        ...EMPTY_RESULT,
        skipped: [
          {
            path: targetFile,
            reason: "existing file is not managed by VibeBasket",
          },
        ],
      };
    }
  }

  registry.entries[relativeTargetPath] = {
    kind: options.kind,
    id: options.id,
    updatedAt: new Date().toISOString(),
  };

  if (currentContent === options.content) {
    await writeManagedRegistry(registryPath, registry);
    return {
      ...EMPTY_RESULT,
      unchanged: [targetFile],
    };
  }

  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(`${targetFile}.bak.${Date.now()}`, currentContent, "utf8");
  await fs.writeFile(targetFile, options.content, "utf8");
  await writeManagedRegistry(registryPath, registry);
  return {
    ...EMPTY_RESULT,
    updated: [targetFile],
  };
}

export function matchesManagedContent(
  currentContent: string,
  expectedContent: string,
  markers: string[] = [],
): boolean {
  if (currentContent === expectedContent) {
    return true;
  }

  return markers.some((marker) => currentContent.includes(marker));
}

async function readManagedRegistry(registryPath: string): Promise<ManagedRegistry> {
  try {
    const content = await fs.readFile(registryPath, "utf8");
    const parsed = JSON.parse(content) as Partial<ManagedRegistry>;
    return {
      version: 1,
      entries: parsed.entries ?? {},
    };
  } catch (error: unknown) {
    if (hasErrorCode(error, "ENOENT")) {
      return { version: 1, entries: {} };
    }
    throw error;
  }
}

async function writeManagedRegistry(
  registryPath: string,
  registry: ManagedRegistry,
): Promise<void> {
  await fs.mkdir(path.dirname(registryPath), { recursive: true });
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");
}

async function readFileIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error: unknown) {
    if (hasErrorCode(error, "ENOENT")) {
      return null;
    }
    throw error;
  }
}

function normalizeManagedPath(file: string): string {
  return file.split(path.sep).join("/");
}
