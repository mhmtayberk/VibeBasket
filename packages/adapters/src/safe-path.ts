import fs from "node:fs/promises";
import path from "node:path";

function isMissingPath(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export async function assertPathWithoutSymbolicLinks(
  trustedRoot: string,
  targetPath: string,
): Promise<void> {
  const root = path.resolve(trustedRoot);
  const target = path.resolve(targetPath);
  const relative = path.relative(root, target);

  if (relative === "" || relative === ".") {
    throw new Error(`Refusing to write to the trusted root itself: ${targetPath}`);
  }
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Target path escaped its trusted root: ${targetPath}`);
  }

  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) {
        throw new Error(`Refusing to access a target through a symbolic link: ${current}`);
      }
    } catch (error: unknown) {
      if (isMissingPath(error)) {
        return;
      }
      throw error;
    }
  }
}
