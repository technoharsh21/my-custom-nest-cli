import chalk from "chalk";
import { execSync } from "child_process";

/**
 * Ensures the correct global store location is set for `pnpm`.
 */
export const fixPnpmStore = () => {
  try {
    const storePath = execSync("pnpm store path").toString().trim();
    console.log(chalk.blue(`ℹ Using pnpm store at: ${storePath}`));

    execSync(`pnpm config set store-dir ${storePath} --global`, {
      stdio: "inherit",
    });
    console.log(chalk.green("✔ Global store directory set correctly."));
  } catch (error) {
    console.log(chalk.red("❌ Failed to set pnpm store directory."));
  }
};
