#!/usr/bin/env node

import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as path from "path";
import * as fs from "fs";
import { setupESLintPrettier } from "./setupESLintPrettier";
import { ensureNestCLI } from "./nest/ensureNestCli";
import { ensurePnpm } from "./pnpm /ensurePnpm";
import { fixPnpmStore } from "./pnpm /fixPnpmStore";
import { collectPostgresConfig } from "./database/postgress/postgressDbInputes";
import { UserConfig } from "./types/inputTypes";
import { setupDatabase } from "./database/configDatabase";
import { collectMongoDbConfig } from "./database/mysql/collectMongoDbConfig";
import { addDockerFiles } from "./docker/addDocker";
import { addModule } from "./userModule/addModule";
import { addSwagger } from "./swagger/addSwagger";

const collectUserInput = async () => {
  const baseConfig = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the NestJS project name:",
      validate: (input) => (input ? true : "Project name cannot be empty."),
    },
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
    {
      type: "list",
      name: "database",
      message: "Which database do you want to use?",
      choices: ["PostgreSQL", "MongoDB", "MySQL"],
      default: "PostgreSQL",
    },
    {
      type: "confirm",
      name: "useTypeORM",
      message: "Do you want to use TypeORM?",
      default: true,
    },
    {
      type: "confirm",
      name: "useSonarQube",
      message: "Do you want to add SonarQube integration?",
      default: true,
    },
    {
      type: "input",
      name: "sonarServerUrl",
      message: "Enter SonarQube Server URL:",
      when: (answers) => answers.useSonarQube,
    },
    {
      type: "input",
      name: "sonarToken",
      message: "Enter SonarQube Token:",
      default: "null",
      when: (answers) => answers.useSonarQube,
    },
    {
      type: "confirm",
      name: "addDocker",
      message: "Do you want to add Docker configuration?",
      default: true,
    },
    {
      type: "confirm",
      name: "addUserModule",
      message: "Do you want to add User module?",
      default: true,
    },
  ]);

  // If PostgreSQL is selected, collect additional details
  let postgresConfig = {};
  let mongoDbConfig = {};
  if (baseConfig.database === "PostgreSQL" || baseConfig.database === "MySQL") {
    postgresConfig = await collectPostgresConfig();
  } else if (baseConfig.database === "MongoDB") {
    mongoDbConfig = await collectMongoDbConfig();
  }

  return { ...baseConfig, ...postgresConfig, ...mongoDbConfig };
};

const main = async () => {
  ensurePnpm();
  fixPnpmStore();
  ensureNestCLI();

  const userConfig = (await collectUserInput()) as UserConfig;
  const projectPath = path.join(process.cwd(), userConfig.projectName);

  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`❌ Folder '${userConfig.projectName}' already exists.`)
    );
    return;
  }

  execSync(
    `pnpm dlx @nestjs/cli new ${userConfig.projectName} --package-manager pnpm`,
    { stdio: "inherit" }
  );

  process.chdir(projectPath);
  fs.writeFileSync(
    ".env",
    `PORT=${userConfig.PORT}\nENVIRONMENT=${userConfig.ENVIRONMENT}\n`
  );

  fs.mkdirSync("src/config", { recursive: true });
  fs.writeFileSync(
    "src/config/app.config.ts",
    `export const appConfig = { port: +process.env.PORT ?? "", environment: process.env.ENVIRONMENT ?? "" };`
  );
  fs.writeFileSync(
    "src/config/env.config.ts",
    `import { config } from 'dotenv';\nconfig();\nexport function getOsEnv(key: string) { return process.env[key] || ''; }`
  );

  setupESLintPrettier();
  addSwagger();

  await setupDatabase(userConfig);

  if (userConfig.addDocker) {
    await addDockerFiles(projectPath);
  }

  if (userConfig.addUserModule) {
    await addModule(userConfig);
  }
};

main();
