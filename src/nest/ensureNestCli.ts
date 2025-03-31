import chalk from "chalk";
import { execSync } from "child_process";

/**
 * Ensures `@nestjs/cli` is installed globally.
 */
export const ensureNestCLI = () => {
  try {
    execSync("nest --version", { stdio: "ignore" });
    console.log(chalk.green("✔ NestJS CLI is already installed."));
  } catch (error) {
    console.log(chalk.yellow("⚠ NestJS CLI is not installed. Installing..."));
    try {
      execSync("pnpm add -g @nestjs/cli", { stdio: "inherit" });
      console.log(chalk.green("✔ NestJS CLI installed successfully."));
    } catch (installError) {
      console.log(
        chalk.red(
          "❌ Failed to install NestJS CLI. Please check your pnpm configuration."
        )
      );
    }
  }
};
