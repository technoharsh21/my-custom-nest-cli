import chalk from "chalk";
import { execSync } from "child_process";

/**
 * Ensures `pnpm` is installed globally.
 */
export const ensurePnpm = () => {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    console.log(chalk.green("✔ pnpm is already installed."));
  } catch (error) {
    console.log(chalk.yellow("⚠ pnpm is not installed. Installing..."));
    execSync("npm install -g pnpm", { stdio: "inherit" });
    console.log(chalk.green("✔ pnpm installed successfully."));
  }
};
