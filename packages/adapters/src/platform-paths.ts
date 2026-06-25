import os from "node:os";
import path from "node:path";

export function getWindowsRoamingDir() {
  return process.env.APPDATA?.trim() || path.join(os.homedir(), "AppData", "Roaming");
}

export function getXdgConfigHome() {
  return process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config");
}

export function getVsCodeGlobalStorageDir(extensionId: string) {
  const platform = os.platform();

  if (platform === "darwin") {
    return path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "Code",
      "User",
      "globalStorage",
      extensionId,
      "settings",
    );
  }

  if (platform === "win32") {
    return path.join(
      getWindowsRoamingDir(),
      "Code",
      "User",
      "globalStorage",
      extensionId,
      "settings",
    );
  }

  return path.join(getXdgConfigHome(), "Code", "User", "globalStorage", extensionId, "settings");
}
