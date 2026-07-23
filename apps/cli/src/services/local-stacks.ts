import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { IdeIdSchema, ScopeSchema } from "../../../../packages/core/src/manifest.js";

const LOCAL_STACK_SCHEMA_VERSION = "1";
const LOCAL_STACK_ID_PATTERN = /^[a-z0-9-]+$/;

const LocalStackItemSnapshotSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["mcp", "skill", "rule", "workflow"]),
  displayName: z.string().min(1),
  description: z.string().nullable().optional(),
});

const LocalStackDocumentSchema = z.object({
  schemaVersion: z.literal(LOCAL_STACK_SCHEMA_VERSION),
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(280).optional(),
  scope: ScopeSchema,
  targetIds: z.array(IdeIdSchema).min(1).max(20),
  itemIds: z.array(z.string().trim().min(1)).min(1).max(100),
  snapshots: z.array(LocalStackItemSnapshotSchema).default([]),
  savedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LocalStackDocument = z.infer<typeof LocalStackDocumentSchema>;

function getStacksDir() {
  return path.join(os.homedir(), ".vibebasket", "stacks");
}

function ensureStacksDir() {
  fs.mkdirSync(getStacksDir(), { recursive: true });
}

function sanitizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function getStackPath(stackId: string) {
  if (!LOCAL_STACK_ID_PATTERN.test(stackId)) {
    throw new Error("Invalid local stack id.");
  }
  return path.join(getStacksDir(), `${stackId}.json`);
}

export function getLocalStacksState() {
  const dir = getStacksDir();
  return {
    available: true,
    path: dir,
    exists: fs.existsSync(dir),
  };
}

export function listLocalStacks(): LocalStackDocument[] {
  if (!fs.existsSync(getStacksDir())) {
    return [];
  }

  return fs
    .readdirSync(getStacksDir())
    .filter((entry) => entry.endsWith(".json"))
    .flatMap((entry) => {
      try {
        const fullPath = path.join(getStacksDir(), entry);
        const raw = fs.readFileSync(fullPath, "utf8");
        return [LocalStackDocumentSchema.parse(JSON.parse(raw))];
      } catch {
        return [];
      }
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getLocalStack(stackId: string): LocalStackDocument | null {
  let fullPath: string;
  try {
    fullPath = getStackPath(stackId);
  } catch {
    return null;
  }
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    return LocalStackDocumentSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLocalStack(
  input: Omit<LocalStackDocument, "schemaVersion" | "savedAt" | "updatedAt">,
): LocalStackDocument {
  ensureStacksDir();

  const timestamp = new Date().toISOString();
  const existing = getLocalStack(input.id);
  const nextDocument: LocalStackDocument = {
    schemaVersion: LOCAL_STACK_SCHEMA_VERSION,
    ...input,
    savedAt: existing?.savedAt ?? timestamp,
    updatedAt: timestamp,
  };
  const validated = LocalStackDocumentSchema.parse(nextDocument);
  fs.writeFileSync(getStackPath(validated.id), JSON.stringify(validated, null, 2));
  return validated;
}

export function createLocalStackId(name: string) {
  const base = sanitizeId(name) || "stack";
  let candidate = base;
  let counter = 2;

  while (fs.existsSync(getStackPath(candidate))) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}
