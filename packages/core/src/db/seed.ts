import { db } from "./index.js";
import { catalogItems } from "./schema.js";

const initialItems = [
  {
    id: "mcp-puppeteer",
    type: "mcp",
    displayName: "Puppeteer (Browser)",
    description: "Allow the AI to control a headless Chrome browser to scrape data and take screenshots.",
    icon: "Globe",
    verified: true,
    data: {
      id: "mcp-puppeteer",
      displayName: "Puppeteer",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
      env: {},
      requiredSecrets: [],
      verified: true
    }
  },
  {
    id: "mcp-postgres",
    type: "mcp",
    displayName: "PostgreSQL",
    description: "Read-only access to your Postgres database for the AI to query schemas and data.",
    icon: "Database",
    verified: true,
    data: {
      id: "mcp-postgres",
      displayName: "PostgreSQL",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "${secret:POSTGRES_URL}"],
      env: {},
      requiredSecrets: ["POSTGRES_URL"],
      verified: true
    }
  },
  {
    id: "mcp-github",
    type: "mcp",
    displayName: "GitHub",
    description: "Full access to GitHub API. AI can create PRs, read repos, and review code.",
    icon: "Github",
    verified: true,
    data: {
      id: "mcp-github",
      displayName: "GitHub",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "${secret:GITHUB_PAT}"
      },
      requiredSecrets: ["GITHUB_PAT"],
      verified: true
    }
  },
  {
    id: "mcp-memory",
    type: "mcp",
    displayName: "Memory Storage",
    description: "Knowledge graph based memory for the AI. Keeps context across sessions.",
    icon: "BrainCircuit",
    verified: true,
    data: {
      id: "mcp-memory",
      displayName: "Memory",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
      env: {},
      requiredSecrets: [],
      verified: true
    }
  },
  {
    id: "skill-nextjs-best-practices",
    type: "skill",
    displayName: "Next.js Best Practices",
    description: "Deep knowledge of App Router, Server Components, caching, and Tailwind optimizations.",
    icon: "Code2",
    verified: true,
    data: {
      id: "skill-nextjs-best-practices",
      displayName: "Next.js Best Practices",
      source: {
        type: "inline",
        content: "Next.js best practices content..."
      },
      verified: true
    }
  },
  {
    id: "rule-memory-bank",
    type: "rule",
    displayName: "Memory Bank Standard",
    description: "Forces the AI to maintain activeContext.md, progress.md and never guess project state.",
    icon: "FileCode2",
    verified: true,
    data: {
      id: "rule-memory-bank",
      displayName: "Memory Bank Standard",
      content: "# Memory Bank Rules...",
      verified: true
    }
  }
];

async function seed() {
  console.log("Seeding catalog...");
  for (const item of initialItems) {
    await db.insert(catalogItems).values(item as any).onConflictDoUpdate({
      target: catalogItems.id,
      set: item as any
    });
  }
  console.log("Seed complete.");
}

seed().catch(console.error);
