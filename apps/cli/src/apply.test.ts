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

const applySkillsMock = vi.fn(async () => undefined);
const applyRulesMock = vi.fn(async () => undefined);

class FakeAdapter {
  displayName = "Cursor";
  supportedScopes: readonly string[] = ["user", "project"];
  supportsMcp = true;
  supportsSkills = false;
  supportsRules = false;
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

class SkillsAndRulesAdapter extends FakeAdapter {
  override displayName = "Claude Code";
  override supportsSkills = true;
  override supportsRules = true;
  override applySkills = applySkillsMock;
  override applyRules = applyRulesMock;
}

class UserOnlyAdapter extends FakeAdapter {
  override displayName = "DeepSeek-TUI";
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
  ClaudeCodeAdapter: SkillsAndRulesAdapter,
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
    applySkillsMock.mockClear();
    applyRulesMock.mockClear();
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

  it("skips trust prompt when --force flag is set", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor"],
        mcps: [],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await applyBundle(tempFile, { force: true });
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("aborts when user declines trust prompt", async () => {
    const { applyBundle } = await import("./apply.js");
    confirmMock.mockResolvedValueOnce(false);
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor"],
        mcps: [],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await applyBundle(tempFile, {});
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(writeConfigMock).not.toHaveBeenCalled();
  });

  it("overrides bundle scope with --scope flag", async () => {
    const { applyBundle } = await import("./apply.js");
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

    await applyBundle(tempFile, { scope: "project", force: true });
    expect(writeConfigMock).toHaveBeenCalled();
  });

  it("runs dry-run without writing config or creating backup", async () => {
    const { applyBundle } = await import("./apply.js");
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

    await applyBundle(tempFile, { dryRun: true, force: true });
    expect(diffMock).toHaveBeenCalled();
    expect(writeConfigMock).not.toHaveBeenCalled();
    expect(createBackupMock).not.toHaveBeenCalled();
  });

  it("rejects when a target is not supported by any adapter (fails at Zod validation)", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["unknown-ide"],
        mcps: [],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await expect(applyBundle(tempFile, { force: true })).rejects.toThrow();
  });

  it("handles a corrupted local bundle file", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(tempFile, "not valid json {{{");

    await expect(applyBundle(tempFile, { force: true })).rejects.toThrow();
  });

  it("handles an invalid schema version in bundle", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "99.9",
        scope: "user",
        targets: ["cursor"],
        mcps: [],
        skills: [],
        rules: [],
        workflowPacks: [],
      }),
    );

    await expect(applyBundle(tempFile, { force: true })).rejects.toThrow();
  });

  it("applies all 4 content types successfully", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["claude-code"],
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
        skills: [
          {
            id: "skill-a",
            displayName: "Skill A",
            source: { type: "inline", content: "x" },
            verified: false,
          },
        ],
        rules: [
          {
            id: "rule-a",
            displayName: "Rule A",
            content: "always",
            verified: false,
          },
        ],
        workflowPacks: [
          {
            id: "wf-a",
            displayName: "Workflow A",
            files: [
              { path: "test/rules.md", content: "hi", ifExists: "skip" },
            ],
            mcps: [],
            skills: [],
            rules: [],
          },
        ],
      }),
    );

    await applyBundle(tempFile, { force: true });
    expect(applySkillsMock).toHaveBeenCalled();
    expect(applyRulesMock).toHaveBeenCalled();
    expect(writeConfigMock).toHaveBeenCalled();
  });

  it("detects unsupported content and warns without failing", async () => {
    const { applyBundle } = await import("./apply.js");
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor"],
        mcps: [],
        skills: [
          {
            id: "skill-a",
            displayName: "Skill A",
            source: { type: "inline", content: "x" },
            verified: false,
          },
        ],
        rules: [
          {
            id: "rule-a",
            displayName: "Rule A",
            content: "always",
            verified: false,
          },
        ],
        workflowPacks: [],
      }),
    );

    await applyBundle(tempFile, { force: true });
    // Cursor adapter doesn't support skills or rules, but it should still succeed
    expect(writeConfigMock).toHaveBeenCalled();
  });

  it("handles single target failing while others succeed", async () => {
    const { applyBundle } = await import("./apply.js");
    writeConfigMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("disk full"));
    fs.writeFileSync(
      tempFile,
      JSON.stringify({
        schemaVersion: "0.1",
        scope: "user",
        targets: ["cursor", "windsurf"],
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
});
