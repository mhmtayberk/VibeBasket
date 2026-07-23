import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalStackId,
  getLocalStack,
  listLocalStacks,
  saveLocalStack,
} from "./local-stacks.js";

describe("local stack storage", () => {
  let tempHome: string;

  beforeEach(() => {
    tempHome = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "vibebasket-stacks-"));
    vi.spyOn(os, "homedir").mockReturnValue(tempHome);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it("saves and loads a local stack", () => {
    const stack = saveLocalStack({
      id: "react-stack",
      name: "React Stack",
      scope: "user",
      targetIds: ["cursor"],
      itemIds: ["item-1"],
      snapshots: [],
    });

    expect(stack.id).toBe("react-stack");
    expect(getLocalStack("react-stack")?.name).toBe("React Stack");
  });

  it("lists stacks in newest-first order", async () => {
    saveLocalStack({
      id: "first-stack",
      name: "First Stack",
      scope: "user",
      targetIds: ["cursor"],
      itemIds: ["item-1"],
      snapshots: [],
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    saveLocalStack({
      id: "second-stack",
      name: "Second Stack",
      scope: "user",
      targetIds: ["claude-code"],
      itemIds: ["item-2"],
      snapshots: [],
    });

    expect(listLocalStacks().map((entry) => entry.id)).toEqual(["second-stack", "first-stack"]);
  });

  it("creates unique stack ids from colliding names", () => {
    saveLocalStack({
      id: "react-stack",
      name: "React Stack",
      scope: "user",
      targetIds: ["cursor"],
      itemIds: ["item-1"],
      snapshots: [],
    });

    expect(createLocalStackId("React Stack")).toBe("react-stack-2");
  });

  it("returns null for invalid stack ids instead of traversing paths", () => {
    expect(getLocalStack("../secrets")).toBeNull();
    expect(getLocalStack("bad/name")).toBeNull();
  });

  it("skips malformed stack files during listing", () => {
    saveLocalStack({
      id: "valid-stack",
      name: "Valid Stack",
      scope: "user",
      targetIds: ["cursor"],
      itemIds: ["item-1"],
      snapshots: [],
    });

    const stacksDir = path.join(tempHome, ".vibebasket", "stacks");
    fs.writeFileSync(path.join(stacksDir, "broken.json"), "{not-json");

    expect(listLocalStacks().map((entry) => entry.id)).toEqual(["valid-stack"]);
  });
});
