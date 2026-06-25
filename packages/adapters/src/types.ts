import type { FileEntry, IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";

export interface IdeAdapterCapabilities {
  readonly supportsMcp: boolean;
  readonly supportsSkills: boolean;
  readonly supportsRules: boolean;
  readonly supportedScopes: readonly Scope[];
}

export interface IdeAdapter extends IdeAdapterCapabilities {
  readonly id: IdeId;
  readonly displayName: string;

  /** Resolve the absolute config path on this OS for a given scope. */
  configPath(scope: Scope, projectRoot?: string): string;

  /** Read existing config; return empty schema if file doesn't exist. */
  readConfig(scope: Scope, projectRoot?: string): Promise<unknown>;

  /** Idempotent merge: never override existing entries unless `force`. */
  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown;

  /** Optional, only if supportsSkills. Writes to ~/.claude/skills/<id>/ or project equivalent. */
  applySkills?(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void>;

  /** Optional, only if supportsRules. Translates a generic Rule into IDE-native format. */
  applyRules?(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void>;

  /** Apply arbitrary file scaffolds (used by workflow packs). */
  applyFiles?(files: FileEntry[], scope: Scope, projectRoot?: string): Promise<void>;

  /** Atomic write with .bak.<timestamp> backup. */
  writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void>;

  /** Compute diff between current and pending config (for --dry-run). */
  diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string>;

  /** Human hint shown after apply (e.g. "Restart Cursor"). */
  postInstallHint(): string;
}
