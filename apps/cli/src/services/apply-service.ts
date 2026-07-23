import type { IdeAdapter } from "@vibebasket/adapters";
import type { ManagedContentApplyOutcome } from "@vibebasket/adapters";
import type { Bundle, IdeId, Scope } from "../../../packages/core/src/manifest.js";
import {
  buildTargetMcpApplyPlan,
  flattenBundleContent,
  getUnsupportedTargetContent,
} from "../apply-helpers.js";
import { createBackup } from "../backup.js";
import { formatVerificationSummary, verifyTargetInstall } from "../install-verification.js";
import { getAdapter } from "../runtime/adapters.js";
import { resolveSecrets } from "../secrets.js";
import { applyWorkflowFiles } from "../workflow-files.js";

export interface ApplyLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface ApplyServiceOptions {
  scope?: Scope;
  force?: boolean;
  dryRun?: boolean;
  verify?: boolean;
  projectRoot?: string;
  interactiveSecrets?: boolean;
  logger?: ApplyLogger;
}

export interface TargetApplyResult {
  targetId: IdeId;
  displayName: string;
  applied: boolean;
  dryRun: boolean;
  skippedReason?: string;
  backupPath?: string;
  postInstallHint?: string;
  verificationSummary?: string;
  managedContent?: {
    rules?: ManagedContentApplyOutcome;
    skills?: ManagedContentApplyOutcome;
  };
}

export interface ApplyServiceResult {
  bundle: Bundle;
  scope: Scope;
  workflowFilesApplied: string[];
  workflowFilesSkipped: Array<{ path: string; reason: string }>;
  unsupportedFeatureMessages: string[];
  requiredSecrets: string[];
  targetResults: TargetApplyResult[];
  failedTargets: Array<{ targetId: IdeId; error: string }>;
}

const noopLogger: ApplyLogger = {
  info() {},
  warn() {},
  error() {},
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function summarizeManagedContent(result: ManagedContentApplyOutcome) {
  if (!result) {
    return "applied";
  }

  const summary: string[] = [];
  if (result.written.length > 0) summary.push(`${result.written.length} written`);
  if (result.updated.length > 0) summary.push(`${result.updated.length} updated`);
  if (result.unchanged.length > 0) summary.push(`${result.unchanged.length} unchanged`);
  if (result.skipped.length > 0) summary.push(`${result.skipped.length} skipped`);
  return summary.join(", ") || "applied";
}

export async function executeBundleApply(
  bundle: Bundle,
  options: ApplyServiceOptions = {},
): Promise<ApplyServiceResult> {
  const logger = options.logger ?? noopLogger;
  const scope = options.scope ?? bundle.scope;
  const projectRoot = scope === "project" ? (options.projectRoot ?? process.cwd()) : undefined;
  const flattened = flattenBundleContent(bundle);

  const unsupportedTargets = bundle.targets.filter((targetId) => !getAdapter(targetId));
  if (unsupportedTargets.length > 0) {
    throw new Error(
      `This bundle references targets the current apply engine cannot install yet: ${unsupportedTargets.join(", ")}.`,
    );
  }

  const scopeUnsupportedTargets = bundle.targets.filter((targetId) => {
    const adapter = getAdapter(targetId);
    return adapter ? !adapter.supportedScopes.includes(scope) : false;
  });
  if (scopeUnsupportedTargets.length > 0) {
    throw new Error(
      `This bundle cannot be applied at ${scope} scope for: ${scopeUnsupportedTargets.join(", ")}.`,
    );
  }

  const unsupportedFeatureMessages: string[] = [];
  const mcpPlans = new Map<IdeId, ReturnType<typeof buildTargetMcpApplyPlan>>();

  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    if (!adapter) continue;

    const mcpPlan = buildTargetMcpApplyPlan(targetId, adapter, flattened.mcps);
    mcpPlans.set(targetId, mcpPlan);

    const unsupportedFeatures = getUnsupportedTargetContent(adapter, flattened);
    if (unsupportedFeatures.length > 0) {
      unsupportedFeatureMessages.push(`${adapter.displayName}: ${unsupportedFeatures.join(", ")}`);
    }

    if (mcpPlan.skipped.length > 0) {
      unsupportedFeatureMessages.push(
        `${adapter.displayName}: skipped MCPs -> ${mcpPlan.skipped
          .map((item) => `${item.displayName} (${item.reason})`)
          .join(", ")}`,
      );
    }
  }

  const requiredSecrets = Array.from(
    new Set(Array.from(mcpPlans.values()).flatMap((plan) => plan.requiredSecrets)),
  );
  const secretProjectRoot = projectRoot ?? process.cwd();
  const interactiveSecrets = options.interactiveSecrets ?? true;
  const secrets =
    interactiveSecrets && secretProjectRoot === process.cwd()
      ? await resolveSecrets(requiredSecrets)
      : await resolveSecrets(requiredSecrets, secretProjectRoot, {
          interactive: interactiveSecrets,
        });

  const workflowFilesApplied: string[] = [];
  const workflowFilesSkipped: Array<{ path: string; reason: string }> = [];
  if (flattened.files.length > 0) {
    if (!projectRoot) {
      logger.warn(
        "Workflow files were included, but file scaffolds only apply in project scope. Skipping workflow files.",
      );
    } else if (options.dryRun) {
      logger.info(
        `Dry run: would apply ${flattened.files.length} workflow file(s) under ${projectRoot}.`,
      );
    } else {
      const workflowResult = await applyWorkflowFiles(flattened.files, projectRoot);
      workflowFilesApplied.push(...workflowResult.written);
      workflowFilesSkipped.push(...workflowResult.skipped);
    }
  }

  const targetResults: TargetApplyResult[] = [];
  const failedTargets: Array<{ targetId: IdeId; error: string }> = [];

  for (const targetId of bundle.targets) {
    const adapter = getAdapter(targetId);
    const mcpPlan = mcpPlans.get(targetId);
    if (!adapter || !mcpPlan) {
      continue;
    }

    try {
      const targetResult = await applyToTarget(
        targetId,
        adapter,
        bundle,
        mcpPlan,
        flattened,
        secrets,
        {
          scope,
          force: options.force ?? false,
          dryRun: options.dryRun ?? false,
          verify: options.verify !== false,
          projectRoot,
          logger,
        },
      );
      targetResults.push(targetResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failedTargets.push({ targetId, error: message });
      logger.error(`Failed to apply to ${targetId}: ${message}`);
    }
  }

  return {
    bundle,
    scope,
    workflowFilesApplied,
    workflowFilesSkipped,
    unsupportedFeatureMessages,
    requiredSecrets,
    targetResults,
    failedTargets,
  };
}

async function applyToTarget(
  targetId: IdeId,
  adapter: IdeAdapter,
  bundle: Bundle,
  mcpPlan: ReturnType<typeof buildTargetMcpApplyPlan>,
  flattened: ReturnType<typeof flattenBundleContent>,
  secrets: Record<string, string>,
  options: {
    scope: Scope;
    force: boolean;
    dryRun: boolean;
    verify: boolean;
    projectRoot?: string;
    logger: ApplyLogger;
  },
): Promise<TargetApplyResult> {
  const shouldApplyMcps = adapter.supportsMcp && mcpPlan.supported.length > 0;
  const shouldApplyRules =
    adapter.supportsRules && Boolean(adapter.applyRules) && flattened.rules.length > 0;
  const shouldApplySkills =
    adapter.supportsSkills && Boolean(adapter.applySkills) && flattened.skills.length > 0;

  if (!shouldApplyMcps && !shouldApplyRules && !shouldApplySkills) {
    const skippedReason =
      mcpPlan.skipped.length > 0
        ? mcpPlan.skipped.map((item) => `${item.displayName} (${item.reason})`).join(", ")
        : `no compatible content for ${adapter.displayName}`;
    return {
      targetId,
      displayName: adapter.displayName,
      applied: false,
      dryRun: options.dryRun,
      skippedReason,
    };
  }

  let backupPath: string | undefined;
  let verificationSummary: string | undefined;
  let ruleOutcome: ManagedContentApplyOutcome | undefined;
  let skillOutcome: ManagedContentApplyOutcome | undefined;

  if (mcpPlan.credentialNotice) {
    options.logger.info(mcpPlan.credentialNotice);
  }

  if (options.dryRun) {
    if (shouldApplyMcps) {
      const currentConfig = await adapter.readConfig(options.scope, options.projectRoot);
      const pendingConfig = adapter.applyMcps(currentConfig, mcpPlan.supported, secrets, {
        force: options.force,
      });
      const diff = await adapter.diff(options.scope, pendingConfig, options.projectRoot);
      options.logger.info(`Dry run diff for ${adapter.displayName}:\n${diff}`);
    }

    return {
      targetId,
      displayName: adapter.displayName,
      applied: true,
      dryRun: true,
      postInstallHint: adapter.postInstallHint(),
    };
  }

  if (shouldApplyMcps) {
    const currentConfig = await adapter.readConfig(options.scope, options.projectRoot);
    const pendingConfig = adapter.applyMcps(currentConfig, mcpPlan.supported, secrets, {
      force: options.force,
    });

    if (stableStringify(currentConfig) !== stableStringify(pendingConfig)) {
      backupPath = await createBackup(targetId, options.scope, currentConfig);
      await adapter.writeConfig(options.scope, pendingConfig, options.projectRoot);
    }
  }

  if (shouldApplyRules && adapter.applyRules) {
    ruleOutcome = await adapter.applyRules(flattened.rules, options.scope, options.projectRoot);
    options.logger.info(`${adapter.displayName} rules: ${summarizeManagedContent(ruleOutcome)}`);
  }

  if (shouldApplySkills && adapter.applySkills) {
    skillOutcome = await adapter.applySkills(flattened.skills, options.scope, options.projectRoot);
    options.logger.info(`${adapter.displayName} skills: ${summarizeManagedContent(skillOutcome)}`);
  }

  if (options.verify) {
    const verification = await verifyTargetInstall(
      targetId,
      adapter,
      options.scope,
      options.projectRoot,
      {
        mcps: shouldApplyMcps ? mcpPlan.supported : [],
        skills: shouldApplySkills ? flattened.skills : [],
        rules: shouldApplyRules ? flattened.rules : [],
      },
    );

    if (!verification.ok) {
      throw new Error(
        `Post-install verification failed (${formatVerificationSummary(verification)})`,
      );
    }
    verificationSummary = formatVerificationSummary(verification);
  }

  return {
    targetId,
    displayName: adapter.displayName,
    applied: true,
    dryRun: false,
    backupPath,
    postInstallHint: adapter.postInstallHint(),
    verificationSummary,
    managedContent: {
      ...(ruleOutcome ? { rules: ruleOutcome } : {}),
      ...(skillOutcome ? { skills: skillOutcome } : {}),
    },
  };
}
