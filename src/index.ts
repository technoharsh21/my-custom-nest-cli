#!/usr/bin/env node

import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as path from "path";
import * as fs from "fs";
import { setupTypeORMPostgres } from "./database/typeorm/setupTypeORMPostgres";
import { setupESLintPrettier } from "./setupESLintPrettier";
import { setupTypeORMMySQL } from "./database/typeorm/setupTypeORMmySql";
import { setupMySQLWithoutTypeORM } from "./database/mysql/setupMySQLWithoutTypeORM";
import { setupPostgresWithoutTypeORM } from "./database/postgress/setupPostgresWithoutTypeORM";

/**
 * Ensures `pnpm` is installed globally.
 */
const ensurePnpm = () => {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    console.log(chalk.green("✔ pnpm is already installed."));
  } catch (error) {
    console.log(chalk.yellow("⚠ pnpm is not installed. Installing..."));
    execSync("npm install -g pnpm", { stdio: "inherit" });
    console.log(chalk.green("✔ pnpm installed successfully."));
  }
};

/**
 * Ensures the correct global store location is set for `pnpm`.
 */
const fixPnpmStore = () => {
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

/**
 * Ensures `@nestjs/cli` is installed globally.
 */
const ensureNestCLI = () => {
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

/**
 * Creates a NestJS project inside a new folder.
 */
const createNestProject = async () => {
  // Ask for project name
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the NestJS project name:",
      validate: (input) => (input ? true : "Project name cannot be empty."),
    },
  ]);

  const projectPath = path.join(process.cwd(), projectName); // Create folder in PWD

  // Create the project directory
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(
        `❌ Folder '${projectName}' already exists. Choose a different name.`
      )
    );
    return;
  }

  fs.mkdirSync(projectPath); // Ensure the folder exists
  console.log(chalk.blue(`📂 Created project folder: ${projectPath}`));

  console.log(chalk.blue(`⏳ Creating NestJS project in: ${projectPath}...`));

  try {
    execSync(`pnpm dlx @nestjs/cli new ${projectName} --package-manager pnpm`, {
      stdio: "inherit",
    });
    console.log(chalk.green(`✔ NestJS project created successfully.`));
    console.log(chalk.yellow(`📁 Project created at: ${projectPath}`));
  } catch (error) {
    console.log(
      chalk.red(
        `❌ Failed to create NestJS project: ${
          error instanceof Error ? error.message : error
        }`
      )
    );
  }

  return projectName;
};

/**
 * Navigates to the project directory and sets up an .env file.
 */
const setupEnvFile = async (projectName: string) => {
  const projectPath = path.join(process.cwd(), projectName);

  // Navigate into project directory
  process.chdir(projectPath);
  console.log(chalk.blue(`📂 Moved into project directory: ${projectPath}`));

  // Ask for environment variables
  const envVariables = await inquirer.prompt([
    {
      type: "input",
      name: "PORT",
      message: "Enter the server port (default: 3000):",
      default: "3000",
    },
    {
      type: "list",
      name: "ENVIRONMENT",
      message: "Select the environment:",
      choices: ["development", "production", "local"],
      default: "development",
    },
  ]);

  // Create .env content
  const envContent = `PORT=${envVariables.PORT}\nENVIRONMENT=${envVariables.ENVIRONMENT}\n`;

  // Write to .env file
  const envFilePath = path.join(projectPath, ".env");
  fs.writeFileSync(envFilePath, envContent);
  console.log(chalk.green("✔ .env file created successfully."));
};

/**
 * Creates a `config` folder and an `app.config.ts` file inside the existing project directory.
 */
const setupConfigFile = () => {
  const configFolderPath = path.join(process.cwd(), "src", "config");
  const configFilePath = path.join(configFolderPath, "app.config.ts");

  // Ensure the config directory exists
  if (!fs.existsSync(configFolderPath)) {
    fs.mkdirSync(configFolderPath, { recursive: true });
    console.log(chalk.blue("📁 Created 'config' folder inside the project."));
  }

  // Define the content of app.config.ts
  const configContent = `import { getOsEnv } from "./env.config";
  
  export const appConfig = {
    port: +getOsEnv("PORT"),
    environment: getOsEnv("ENVIRONMENT"),
  };`;

  // Write to the config file
  fs.writeFileSync(configFilePath, configContent);
  console.log(chalk.green("✔ Created 'app.config.ts' inside the project."));
};

/**
 * Creates an `env.config.ts` file inside the `src/config` folder.
 */
const setupEnvConfigFile = () => {
  const configFolderPath = path.join(process.cwd(), "src", "config");
  const envConfigFilePath = path.join(configFolderPath, "env.config.ts");

  // Ensure the config directory exists
  if (!fs.existsSync(configFolderPath)) {
    fs.mkdirSync(configFolderPath, { recursive: true });
    console.log(chalk.blue("📁 Created 'config' folder inside the project."));
  }

  // Define the content of env.config.ts
  const envConfigContent = `import { config } from "dotenv";
  
  config();
  
  export function getOsEnv(key: string): string {
    if (typeof process.env[key] === "undefined") {
      throw Error(\`Environment variable \${key} is not set.\`);
    }
    return process.env[key];
  }
  
  // To Retrieve Env variable which might be undefined
  export function getOsEnvOptional(key: string): string | undefined {
    return process.env[key];
  };`;

  // Write to the env.config.ts file
  fs.writeFileSync(envConfigFilePath, envConfigContent);
  console.log(chalk.green("✔ Created 'env.config.ts' inside the project."));
};

/**
 * Prompts the user to select a database first.
 */
const selectDatabase = async () => {
  const { database } = await inquirer.prompt([
    {
      type: "list",
      name: "database",
      message: "Which database do you want to use?",
      choices: ["PostgreSQL", "MongoDB", "MySQL"],
      default: "PostgreSQL",
    },
  ]);

  await askForTypeORM(database);
};

/**
 * Asks the user whether they want to use TypeORM, then calls the respective setup function.
 */
const askForTypeORM = async (databaseName: string) => {
  const { useTypeORM } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useTypeORM",
      message: `Do you want to use TypeORM for ${databaseName}?`,
      default: true,
    },
  ]);

  if (useTypeORM) {
    if (databaseName === "PostgreSQL") {
      await setupTypeORMPostgres();
    } else if (databaseName === "MySQL") {
      await setupTypeORMMySQL();
    } else {
      console.log(
        chalk.yellow(
          `⚠ TypeORM setup for ${databaseName} is not implemented yet.`
        )
      );
    }
  } else {
    if (databaseName === "PostgreSQL") {
      await setupPostgresWithoutTypeORM();
    } else if (databaseName === "MySQL") {
      await setupMySQLWithoutTypeORM();
    } else {
      console.log(
        chalk.yellow(`⚠ setup for ${databaseName} is not implemented yet.`)
      );
    }
  }
};

const setupSonarQube = async () => {
  const { useSonarQube } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useSonarQube",
      message: "Do you want to add SonarQube integration?",
      default: true,
    },
  ]);

  if (!useSonarQube) return;

  const { sonarServerUrl, sonarToken } = await inquirer.prompt([
    {
      type: "input",
      name: "sonarServerUrl",
      message: "Enter SonarQube Server URL:",
      default: "",
    },
    {
      type: "input",
      name: "sonarToken",
      message: "Enter SonarQube Token:",
      default: "null",
    },
  ]);

  // Install required dependencies
  console.log("Installing SonarQube scanner, Husky, and lint-staged...");
  execSync("pnpm add -D sonarqube-scanner husky lint-staged", {
    stdio: "inherit",
  });

  // Enable Husky
  execSync("pnpm husky install", { stdio: "inherit" });

  // Create Husky pre-commit hook
  fs.mkdirSync(".husky", { recursive: true });
  fs.writeFileSync(
    ".husky/pre-commit",
    `#!/bin/sh\n. $(dirname "$0")/_/husky.sh\npnpm lint-staged\npnpm sonar || { echo \"SonarQube analysis failed. Aborting push.\"; exit 1; }\n`,
    { mode: 0o755 }
  );

  // Create SonarQube analysis script
  const sonarScript = `
    require("dotenv").config();
    const scanner = require("sonarqube-scanner").default;
  
    scanner(
      {
        serverUrl: process.env.SONAR_SERVER_URL,
        token: process.env.SONAR_TOKEN,
        options: {
          "sonar.projectKey": "budget-control-api",
          "sonar.qualitygate.wait": "true",
          "sonar.token": process.env.SONAR_TOKEN,
          "sonar.exclusions": "node_modules/**, src/migrations/**",
        },
      },
      (error) => {
        if (error) {
          return process.exit(1);
        }
        return process.exit(0);
      },
    );
    `;
  fs.writeFileSync("sonar-analysis.js", sonarScript);

  // Update package.json scripts
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  packageJson.scripts = {
    ...packageJson.scripts,
    sonar: "node ./sonar-analysis.js",
  };

  // Configure lint-staged
  packageJson["lint-staged"] = {
    "*.ts": ["pnpm format", "pnpm lint"],
  };
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  // Set environment variables
  fs.appendFileSync(
    ".env",
    `\nSONAR_SERVER_URL=${sonarServerUrl}\nSONAR_TOKEN=${sonarToken}\n`
  );

  console.log("✅ SonarQube and Husky setup completed!");
};

const main = async () => {
  ensurePnpm();
  fixPnpmStore();
  ensureNestCLI();

  const projectName = await createNestProject();

  if (projectName) {
    await setupEnvFile(projectName);
    setupEnvConfigFile();
    setupConfigFile();
  }

  setupESLintPrettier();
  await selectDatabase();
  await setupSonarQube();
};

main();
