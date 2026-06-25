import fs from "node:fs/promises";
import path from "node:path";
import type { FileEntry } from "../../../packages/core/src/manifest.js";

export interface WorkflowFileApplyResult {
  written: string[];
  skipped: Array<{ path: string; reason: string }>;
}

function resolveSafeDestination(projectRoot: string, relativePath: string) {
  const destination = path.resolve(projectRoot, relativePath);
  const normalizedRoot = path.resolve(projectRoot);

  if (destination !== normalizedRoot && !destination.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error(`Workflow file path escaped project root: ${relativePath}`);
  }

  return destination;
}

async function writeWithOptionalBackup(destination: string, content: string) {
  try {
    const existing = await fs.readFile(destination, "utf8");
    await fs.writeFile(`${destination}.bak.${Date.now()}`, existing, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await fs.writeFile(destination, content, "utf8");
}

export async function applyWorkflowFiles(
  files: FileEntry[],
  projectRoot: string,
): Promise<WorkflowFileApplyResult> {
  const written: string[] = [];
  const skipped: Array<{ path: string; reason: string }> = [];

  for (const file of files) {
    const destination = resolveSafeDestination(projectRoot, file.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });

    try {
      const existing = await fs.readFile(destination, "utf8");

      if (file.ifExists === "skip") {
        skipped.push({ path: file.path, reason: "file already exists" });
        continue;
      }

      if (file.ifExists === "merge") {
        if (existing.includes(file.content)) {
          skipped.push({
            path: file.path,
            reason: "existing file already contains workflow content",
          });
          continue;
        }

        await writeWithOptionalBackup(
          destination,
          existing.trimEnd() ? `${existing.trimEnd()}\n\n${file.content}\n` : `${file.content}\n`,
        );
        written.push(file.path);
        continue;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    await writeWithOptionalBackup(destination, file.content);
    written.push(file.path);
  }

  return { written, skipped };
}
