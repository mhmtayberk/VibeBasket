import type { McpEntry } from "@vibebasket/core";

export const mockCatalog = {
  mcps: [
    {
      id: "mcp-puppeteer",
      name: "Puppeteer (Browser)",
      description: "Allow the AI to control a headless Chrome browser to scrape data and take screenshots.",
      icon: "Globe",
      mcpData: {
        id: "mcp-puppeteer",
        displayName: "Puppeteer",
        runtime: "npx",
        args: ["-y", "@modelcontextprotocol/server-puppeteer"],
        env: {},
        requiredSecrets: [],
        verified: true
      } as McpEntry
    },
    {
      id: "mcp-postgres",
      name: "PostgreSQL",
      description: "Read-only access to your Postgres database for the AI to query schemas and data.",
      icon: "Database",
      mcpData: {
        id: "mcp-postgres",
        displayName: "PostgreSQL",
        runtime: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres", "${secret:POSTGRES_URL}"],
        env: {},
        requiredSecrets: ["POSTGRES_URL"],
        verified: true
      } as McpEntry
    },
    {
      id: "mcp-github",
      name: "GitHub",
      description: "Full access to GitHub API. AI can create PRs, read repos, and review code.",
      icon: "Github",
      mcpData: {
        id: "mcp-github",
        displayName: "GitHub",
        runtime: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: "${secret:GITHUB_PAT}"
        },
        requiredSecrets: ["GITHUB_PAT"],
        verified: true
      } as McpEntry
    },
    {
      id: "mcp-memory",
      name: "Memory Storage",
      description: "Knowledge graph based memory for the AI. Keeps context across sessions.",
      icon: "BrainCircuit",
      mcpData: {
        id: "mcp-memory",
        displayName: "Memory",
        runtime: "npx",
        args: ["-y", "@modelcontextprotocol/server-memory"],
        env: {},
        requiredSecrets: [],
        verified: true
      } as McpEntry
    }
  ],
  skills: [
    {
      id: "skill-nextjs-best-practices",
      name: "Next.js Best Practices",
      description: "Deep knowledge of App Router, Server Components, caching, and Tailwind optimizations.",
      icon: "Code2"
    },
    {
      id: "skill-ui-ux-pro-max",
      name: "UI/UX Pro Max",
      description: "Premium design intelligence for creating glassmorphism, OLED dark mode, and stunning layouts.",
      icon: "Palette"
    }
  ],
  rules: [
    {
      id: "rule-memory-bank",
      name: "Memory Bank Standard",
      description: "Forces the AI to maintain activeContext.md, progress.md and never guess project state.",
      icon: "FileCode2"
    }
  ]
};
