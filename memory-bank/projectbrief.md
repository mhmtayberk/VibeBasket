# VibeBasket - Project Brief

## Project Goals
VibeBasket is the "Ninite for vibe coding". It provides a centralized, web-based catalog to select MCP servers, Claude Skills, Rules files, and Workflow Packs. It outputs a shareable URL and a simple `npx` command to automatically configure all selected components across multiple AI coding IDEs securely and idempotently. The product now deliberately distinguishes between editors we can truly install into today and the broader AI IDE ecosystem we want to visibly track in the UI.

## Core Requirements
- Shareable anonymous bundles of configuration.
- Single command execution (`npx vibebasket apply <url>`).
- Seamless multi-IDE adapter system (24 targets: Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, DeepSeek-TUI, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy, OpenCode).
- Honest target visibility: all listed targets have real adapter-backed support.
- Strict JSON validation with Zod.
- Securely prompt for secrets without storing them.
- Idempotent writes with timestamped backups.
- Trusted federated catalog ingestion from curated data and official upstream registries.
- Catalog UX that remains usable even when the dataset grows to thousands of items.
- FTS5 full-text catalog search with prefix-matching.
- 6 backup storage backends with AES-256-GCM encrypted credentials.
- Helm chart for Kubernetes deployments.
- Mobile-responsive with FAB bottom sheet basket UI.

## Target Audience
AI developers and "vibe coders" using multiple LLM-assisted IDEs who want to rapidly bootstrap their toolchains.
