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
import { setupMongoDBWithoutTypeORM } from "./database/mongodb/setupMongoDBWithoutTypeORM";
import { setupMongoDBWithTypeORM } from "./database/typeorm/setupMongoDBWithTypeORM";
import { ensureNestCLI } from "./nest/ensureNestCli";
import { ensurePnpm } from "./pnpm /ensurePnpm";
import { fixPnpmStore } from "./pnpm /fixPnpmStore";
import { collectPostgresConfig } from "./database/postgress/postgressDbInputes";

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
  ]);

  // If PostgreSQL is selected, collect additional details
  let postgresConfig = {};
  if (baseConfig.database === "PostgreSQL") {
    postgresConfig = await collectPostgresConfig();
  }

  return { ...baseConfig, ...postgresConfig };
};

const main = async () => {
  ensurePnpm();
  fixPnpmStore();
  ensureNestCLI();

  const userConfig = (await collectUserInput()) as {
    projectName: string;
    PORT: string;
    ENVIRONMENT: string;
    database: string;
    useTypeORM: boolean;
    useSonarQube: boolean;
    sonarServerUrl: string;
    sonarToken: string;
    databaseHost: string;
    databasePort: number;
    databaseName: string;
    databaseUser: string;
    databasePassword: string;
    databaseSSL: boolean;
    databaseSync: boolean;
    databaseLogging: boolean;
  };
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
    `export const appConfig = { port: +process.env.PORT!, environment: process.env.ENVIRONMENT! };`
  );
  fs.writeFileSync(
    "src/config/env.config.ts",
    `import { config } from 'dotenv';\nconfig();\nexport function getOsEnv(key: string) { return process.env[key] || ''; }`
  );

  setupESLintPrettier();

  if (userConfig.useTypeORM) {
    if (userConfig.database === "PostgreSQL") {
      await setupTypeORMPostgres({
        databaseHost: userConfig.databaseHost,
        databasePort: userConfig.databasePort,
        databaseName: userConfig.databaseName,
        databaseUser: userConfig.databaseUser,
        databasePassword: userConfig.databasePassword,
        databaseSSL: userConfig.databaseSSL,
        databaseSync: userConfig.databaseSync,
        databaseLogging: userConfig.databaseLogging,
      });
    } else if (userConfig.database === "MongoDB") {
      await setupMongoDBWithTypeORM();
    } else if (userConfig.database === "MySQL") {
      await setupTypeORMMySQL();
    }
  } else {
    if (userConfig.database === "PostgreSQL") {
      await setupPostgresWithoutTypeORM();
    } else if (userConfig.database === "MongoDB") {
      await setupMongoDBWithoutTypeORM();
    } else if (userConfig.database === "MySQL") {
      await setupMySQLWithoutTypeORM();
    }
  }
};

main();
