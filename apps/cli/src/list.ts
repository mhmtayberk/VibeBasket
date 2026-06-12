import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import chalk from "chalk";
import {
	CursorAdapter,
	AntigravityAdapter,
	WindsurfAdapter,
	VSCodeAdapter,
	ClaudeCodeAdapter,
	DeepSeekTuiAdapter,
	GeminiCliAdapter,
	KiroAdapter,
	JunieAdapter,
	ClineCliAdapter,
	ZedAdapter,
	CodexAdapter,
	ContinueAdapter,
	RooCodeAdapter,
	HermesAdapter,
	OpenClawAdapter,
	GitHubCopilotAdapter,
	VoidAdapter,
	AiderAdapter,
	CortexCodeAdapter,
	GooseAdapter,
	IBMBobAdapter,
	CodeBuddyAdapter,
} from "@vibebasket/adapters";
import type { IdeAdapter } from "@vibebasket/adapters";

const ADAPTERS: Record<string, IdeAdapter> = {
	cursor: new CursorAdapter(),
	antigravity: new AntigravityAdapter(),
	windsurf: new WindsurfAdapter(),
	vscode: new VSCodeAdapter(),
	"claude-code": new ClaudeCodeAdapter(),
	"deepseek-tui": new DeepSeekTuiAdapter(),
	"gemini-cli": new GeminiCliAdapter(),
	kiro: new KiroAdapter(),
	junie: new JunieAdapter(),
	"cline-cli": new ClineCliAdapter(),
	zed: new ZedAdapter(),
	codex: new CodexAdapter(),
	continue: new ContinueAdapter(),
	roocode: new RooCodeAdapter(),
	hermes: new HermesAdapter(),
	openclaw: new OpenClawAdapter(),
	"github-copilot": new GitHubCopilotAdapter(),
	void: new VoidAdapter(),
	aider: new AiderAdapter(),
	"cortex-code": new CortexCodeAdapter(),
	goose: new GooseAdapter(),
	"ibm-bob": new IBMBobAdapter(),
	codebuddy: new CodeBuddyAdapter(),
};

function fileExists(filePath: string): boolean {
	try {
		fs.accessSync(filePath);
		return true;
	} catch {
		return false;
	}
}

function listSkills(dir: string): string[] {
	if (!fileExists(dir)) return [];
	try {
		return fs.readdirSync(dir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
	} catch {
		return [];
	}
}

function listRules(dir: string): string[] {
	if (!fileExists(dir)) return [];
	try {
		return fs.readdirSync(dir, { withFileTypes: true })
			.filter((d) => d.isFile() && d.name.endsWith(".md"))
			.map((d) => d.name.replace(".md", ""));
	} catch {
		return [];
	}
}

export async function runList() {
	console.log(chalk.bold("\n📋 Installed IDE Configurations\n"));

	for (const [targetId, adapter] of Object.entries(ADAPTERS)) {
		let hasContent = false;
		const lines: string[] = [];
		lines.push(chalk.bold.cyan(`${adapter.displayName} (${targetId})`));

		if (adapter.supportsMcp) {
			let mcps: string[] = [];
			try {
				const config = await adapter.readConfig("user");
				const mcpServers = (config as Record<string, unknown>)?.mcpServers as Record<string, unknown> | undefined;
				if (mcpServers) {
					mcps = Object.keys(mcpServers);
				}
			} catch {
				mcps = [];
			}
			if (mcps.length > 0) {
				hasContent = true;
				lines.push(`  MCP Servers (${mcps.length}): ${mcps.map((m) => chalk.green(m)).join(", ")}`);
			} else {
				lines.push(`  MCP Servers: ${chalk.gray("none")}`);
			}
		}

		if (adapter.supportsSkills) {
			const skillsDir = adapter.configPath("user").includes(os.homedir())
				? path.join(os.homedir(), ".claude", "skills")
				: undefined;
			// Use common skills paths
			let skills: string[] = [];
			const commonSkillsPaths = [
				path.join(os.homedir(), ".claude", "skills"),
				path.join(os.homedir(), ".cursor", "skills"),
				path.join(os.homedir(), ".continue", "prompts"),
				path.join(os.homedir(), ".codebuddy", "skills"),
				path.join(os.homedir(), ".bob", "skills"),
				path.join(os.homedir(), ".snowflake", "cortex", "skills"),
			];
			for (const p of commonSkillsPaths) {
				skills.push(...listSkills(p));
			}
			const unique = [...new Set(skills)];
			if (unique.length > 0) {
				hasContent = true;
				lines.push(`  Skills (${unique.length}): ${unique.map((s) => chalk.yellow(s)).join(", ")}`);
			} else {
				lines.push(`  Skills: ${chalk.gray("none")}`);
			}
		}

		if (adapter.supportsRules) {
			let rules: string[] = [];
			const commonRulesPaths = [
				path.join(os.homedir(), ".cursor", "rules"),
				path.join(os.homedir(), ".claude", "rules"),
			];
			const projPaths = [
				path.join(process.cwd(), ".cursor", "rules"),
				path.join(process.cwd(), ".github", "copilot-instructions.md"),
			];
			for (const p of [...commonRulesPaths, ...projPaths]) {
				if (fileExists(p)) {
					rules.push(...listRules(p));
				}
			}
			const unique = [...new Set(rules)];
			if (unique.length > 0) {
				hasContent = true;
				lines.push(`  Rules (${unique.length}): ${unique.map((r) => chalk.magenta(r)).join(", ")}`);
			} else {
				lines.push(`  Rules: ${chalk.gray("none")}`);
			}
		}

		if (!hasContent) {
			lines.push(`  ${chalk.gray("No VibeBasket-managed content found.")}`);
		}

		console.log(lines.join("\n"));
		console.log();
	}
}
