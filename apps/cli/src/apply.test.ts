import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const confirmMock = vi.fn(async () => true);
const createBackupMock = vi.fn(async () => "/tmp/backup.json");
const resolveSecretsMock = vi.fn(async () => ({}));
const readConfigMock = vi.fn(async () => ({ mcpServers: {} }));
const writeConfigMock = vi.fn(async () => undefined);
const diffMock = vi.fn(async () => "{}");
const verifyTargetInstallMock = vi.fn(async () => ({
  ok: true,
  configReadable: true,
  missingMcpIds: [],
  skills: { checked: false, verified: true, missingPaths: [], missingMarkerIds: [] },
  rules: { checked: false, verified: true, missingPaths: [], missingMarkerIds: [] },
}));

class FakeAdapter {
  displayName = "Cursor";
  supportedScopes: readonly string[] = ["user", "project"];
  readConfig = readConfigMock;
  applyMcps(config: unknown) {
    return config;
  }
  writeConfig = writeConfigMock;
  diff = diffMock;
  postInstallHint() {
    return "hint";
  }
}

class UserOnlyAdapter extends FakeAdapter {
  override displayName = "Cline CLI";
  override supportedScopes: readonly string[] = ["user"];
}

vi.mock("@inquirer/prompts", () => ({
  confirm: confirmMock,
}));

vi.mock("./backup.js", () => ({
  createBackup: createBackupMock,
}));

vi.mock("./secrets.js", () => ({
  resolveSecrets: resolveSecretsMock,
}));

vi.mock("./install-verification.js", () => ({
  verifyTargetInstall: verifyTargetInstallMock,
  formatVerificationSummary: vi.fn(() => "config readback ok"),
}));

vi.mock("@vibebasket/adapters", () => ({
  CursorAdapter: FakeAdapter,
  AntigravityAdapter: FakeAdapter,
  WindsurfAdapter: FakeAdapter,
  VSCodeAdapter: FakeAdapter,
  ClaudeCodeAdapter: FakeAdapter,
  DeepSeekTuiAdapter: UserOnlyAdapter,
  GeminiCliAdapter: FakeAdapter,
  KiroAdapter: FakeAdapter,
  JunieAdapter: FakeAdapter,
  ClineCliAdapter: UserOnlyAdapter,
  ZedAdapter: FakeAdapter,
  CodexAdapter: FakeAdapter,
  ContinueAdapter: FakeAdapter,
  RooCodeAdapter: FakeAdapter,
  HermesAdapter: FakeAdapter,
  OpenClawAdapter: FakeAdapter,
  GitHubCopilotAdapter: FakeAdapter,
  VoidAdapter: FakeAdapter,
  AiderAdapter: FakeAdapter,
  CortexCodeAdapter: FakeAdapter,
  GooseAdapter: FakeAdapter,
  IBMBobAdapter: FakeAdapter,
  CodeBuddyAdapter: FakeAdapter,
  OpenCodeAdapter: FakeAdapter,
}));

describe("applyBundle", () => {
  let tempFile: string;

  beforeEach(() => {
    tempFile = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "vibebasket-apply-")),
      "bundle.json",
    );
    readConfigMock.mockClear();
    writeConfigMock.mockClear();
    diffMock.mockClear();
    createBackupMock.mockClear();
    resolveSecretsMock.mockClear();
    confirmMock.mockClear();
    verifyTargetInstallMock.mockClear();
  });

  afterEach(() => {
    if (tempFile) {
      fs.rmSync(path.dirname(tempFile), { recursive: true, force: true });
    }
  });

  it("fails when a target does not support the requested scope", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "project",
        targets: ["cline-cli"],
        mcps: [],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await expect(applyBundle(tempFile, {})).rejects.toThrow("cannot be applied at project scope");
  });

  it("fails the overall apply when a target write fails", async () => {
    const { applyBundle } = await import("./apply.js");
    writeConfigMock.mockRejectedValueOnce(new Error("disk full"));
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor"],
        mcps: [
          {
            id: "github",
            displayName: "GitHub",
            runtime: "npx",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {},
            requiredSecrets: [],
            verified: true,
          },
        ],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await expect(applyBundle(tempFile, { force: true })).rejects.toThrow(
      "Bundle apply was incomplete",
    );
  });

  it("fails the overall apply when post-install verification fails", async () => {
    const { applyBundle } = await import("./apply.js");
    verifyTargetInstallMock.mockResolvedValueOnce({
      ok: false,
      configReadable: true,
      missingMcpIds: ["github"],
      skills: { checked: false, verified: true, missingPaths: [], missingMarkerIds: [] },
      rules: { checked: false, verified: true, missingPaths: [], missingMarkerIds: [] },
    });
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor"],
        mcps: [
          {
            id: "github",
            displayName: "GitHub",
            runtime: "npx",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {},
            requiredSecrets: [],
            verified: true,
          },
        ],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await expect(applyBundle(tempFile, { force: true })).rejects.toThrow(
      "Bundle apply was incomplete",
    );
    expect(verifyTargetInstallMock).toHaveBeenCalledTimes(1);
  });
});
