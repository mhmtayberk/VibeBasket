import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";

export async function initProject() {
  console.log(chalk.blue("🧺 Welcome to VibeBasket! Let's initialize your project.\n"));

  const projectName = await input({
    message: "Project name:",
    default: path.basename(process.cwd()),
  });

  const projectRoot = process.cwd();
  const vbDir = path.join(projectRoot, ".vibebasket");

  // 1. Create .vibebasket directory
  if (!fs.existsSync(vbDir)) {
    fs.mkdirSync(vbDir);
    console.log(chalk.green(`✔ Created ${chalk.bold(".vibebasket/")} directory`));
  }

  // 2. Create subdirectories
  ["rules", "skills", "workflows"].forEach((dir) => {
    const dirPath = path.join(vbDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
  console.log(chalk.green(`✔ Created rules, skills, and workflows subdirectories`));

  // 3. Create .vibebasket.env boilerplate
  const envPath = path.join(projectRoot, ".vibebasket.env");
  if (!fs.existsSync(envPath)) {
    const envContent = `# VibeBasket Environment Variables
# Use this file to store local secrets. DO NOT commit this file to Git.

# Examples:
# GITHUB_PAT=your_token
# OPENAI_API_KEY=your_key
`;
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green(`✔ Created ${chalk.bold(".vibebasket.env")} boilerplate`));
  }

  // 4. Update .gitignore
  const gitignorePath = path.join(projectRoot, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    if (!content.includes(".vibebasket.env")) {
      fs.appendFileSync(gitignorePath, "\n# VibeBasket secrets\n.vibebasket.env\n");
      console.log(chalk.green(`✔ Added ${chalk.bold(".vibebasket.env")} to .gitignore`));
    }
  }

  console.log(chalk.blue("\n✨ VibeBasket initialization complete!"));
  console.log(`\nYou can now place your local rules in ${chalk.bold(".vibebasket/rules/")}`);
}
