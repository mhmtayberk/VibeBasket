import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getVsCodeGlobalStorageDir,
  getWindowsRoamingDir,
  getXdgConfigHome,
} from "./platform-paths";

describe("platform path helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("prefers APPDATA for Windows roaming paths", () => {
    vi.stubEnv("APPDATA", "C:\\Users\\demo\\AppData\\Roaming");
    expect(getWindowsRoamingDir()).toBe("C:\\Users\\demo\\AppData\\Roaming");
  });

  it("prefers XDG_CONFIG_HOME for XDG-aware paths", () => {
    vi.stubEnv("XDG_CONFIG_HOME", "/tmp/xdg-config");
    expect(getXdgConfigHome()).toBe("/tmp/xdg-config");
  });

  it("builds VS Code globalStorage under APPDATA on Windows", () => {
    vi.spyOn(os, "platform").mockReturnValue("win32");
    vi.stubEnv("APPDATA", "C:\\Users\\demo\\AppData\\Roaming");

    expect(getVsCodeGlobalStorageDir("saoudrizwan.claude-dev")).toBe(
      path.join(
        "C:\\Users\\demo\\AppData\\Roaming",
        "Code",
        "User",
        "globalStorage",
        "saoudrizwan.claude-dev",
        "settings",
      ),
    );
  });
});
