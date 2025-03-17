#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const chalk_1 = require("chalk");
const inquirer_1 = require("inquirer");
const path = require("path");
const fs = require("fs");
/**
 * Ensures `pnpm` is installed globally.
 */
const ensurePnpm = () => {
    try {
        (0, child_process_1.execSync)("pnpm --version", { stdio: "ignore" });
        console.log(chalk_1.default.green("✔ pnpm is already installed."));
    }
    catch (error) {
        console.log(chalk_1.default.yellow("⚠ pnpm is not installed. Installing..."));
        (0, child_process_1.execSync)("npm install -g pnpm", { stdio: "inherit" });
        console.log(chalk_1.default.green("✔ pnpm installed successfully."));
    }
};
/**
 * Ensures the correct global store location is set for `pnpm`.
 */
const fixPnpmStore = () => {
    try {
        const storePath = (0, child_process_1.execSync)("pnpm store path").toString().trim();
        console.log(chalk_1.default.blue(`ℹ Using pnpm store at: ${storePath}`));
        (0, child_process_1.execSync)(`pnpm config set store-dir ${storePath} --global`, {
            stdio: "inherit",
        });
        console.log(chalk_1.default.green("✔ Global store directory set correctly."));
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Failed to set pnpm store directory."));
    }
};
/**
 * Ensures `@nestjs/cli` is installed globally.
 */
const ensureNestCLI = () => {
    try {
        (0, child_process_1.execSync)("nest --version", { stdio: "ignore" });
        console.log(chalk_1.default.green("✔ NestJS CLI is already installed."));
    }
    catch (error) {
        console.log(chalk_1.default.yellow("⚠ NestJS CLI is not installed. Installing..."));
        try {
            (0, child_process_1.execSync)("pnpm add -g @nestjs/cli", { stdio: "inherit" });
            console.log(chalk_1.default.green("✔ NestJS CLI installed successfully."));
        }
        catch (installError) {
            console.log(chalk_1.default.red("❌ Failed to install NestJS CLI. Please check your pnpm configuration."));
        }
    }
};
/**
 * Creates a NestJS project inside a new folder.
 */
const createNestProject = () => __awaiter(void 0, void 0, void 0, function* () {
    // Ask for project name
    const { projectName } = yield inquirer_1.default.prompt([
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
        console.log(chalk_1.default.red(`❌ Folder '${projectName}' already exists. Choose a different name.`));
        return;
    }
    fs.mkdirSync(projectPath); // Ensure the folder exists
    console.log(chalk_1.default.blue(`📂 Created project folder: ${projectPath}`));
    console.log(chalk_1.default.blue(`⏳ Creating NestJS project in: ${projectPath}...`));
    try {
        (0, child_process_1.execSync)(`pnpm dlx @nestjs/cli new ${projectName} --package-manager pnpm`, {
            stdio: "inherit",
        });
        console.log(chalk_1.default.green(`✔ NestJS project created successfully.`));
        console.log(chalk_1.default.yellow(`📁 Project created at: ${projectPath}`));
    }
    catch (error) {
        console.log(chalk_1.default.red(`❌ Failed to create NestJS project: ${error instanceof Error ? error.message : error}`));
    }
    return projectName;
});
/**
 * Navigates to the project directory and sets up an .env file.
 */
const setupEnvFile = (projectName) => __awaiter(void 0, void 0, void 0, function* () {
    const projectPath = path.join(process.cwd(), projectName);
    // Navigate into project directory
    process.chdir(projectPath);
    console.log(chalk_1.default.blue(`📂 Moved into project directory: ${projectPath}`));
    // Ask for environment variables
    const envVariables = yield inquirer_1.default.prompt([
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
    console.log(chalk_1.default.green("✔ .env file created successfully."));
});
/**
 * Creates a `config` folder and an `app.config.ts` file inside the existing project directory.
 */
const setupConfigFile = () => {
    const configFolderPath = path.join(process.cwd(), "src", "config");
    const configFilePath = path.join(configFolderPath, "app.config.ts");
    // Ensure the config directory exists
    if (!fs.existsSync(configFolderPath)) {
        fs.mkdirSync(configFolderPath, { recursive: true });
        console.log(chalk_1.default.blue("📁 Created 'config' folder inside the project."));
    }
    // Define the content of app.config.ts
    const configContent = `import { getOsEnv } from "./env.config";
  
  export const appConfig = {
    port: +getOsEnv("PORT"),
    environment: getOsEnv("ENVIRONMENT"),
  };`;
    // Write to the config file
    fs.writeFileSync(configFilePath, configContent);
    console.log(chalk_1.default.green("✔ Created 'app.config.ts' inside the project."));
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
        console.log(chalk_1.default.blue("📁 Created 'config' folder inside the project."));
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
    console.log(chalk_1.default.green("✔ Created 'env.config.ts' inside the project."));
};
/**
 * Prompts the user to select a database first.
 */
const selectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const { database } = yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "database",
            message: "Which database do you want to use?",
            choices: ["PostgreSQL", "MongoDB", "MySQL"],
            default: "PostgreSQL",
        },
    ]);
    askForTypeORM(database);
});
/**
 * Asks the user whether they want to use TypeORM, then calls the respective setup function.
 */
const askForTypeORM = (databaseName) => __awaiter(void 0, void 0, void 0, function* () {
    const { useTypeORM } = yield inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "useTypeORM",
            message: `Do you want to use TypeORM for ${databaseName}?`,
            default: true,
        },
    ]);
    if (useTypeORM) {
        if (databaseName === "PostgreSQL") {
            yield setupTypeORMPostgres();
        }
        else {
            console.log(chalk_1.default.yellow(`⚠ TypeORM setup for ${databaseName} is not implemented yet.`));
        }
    }
    else {
        console.log(chalk_1.default.yellow(`⚠ Skipping TypeORM setup for ${databaseName}.`));
    }
});
/**
 * Installs PostgreSQL dependencies and sets up TypeORM inside `src/modules/database/`.
 */
const setupTypeORMPostgres = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.blue("📦 Installing PostgreSQL & TypeORM dependencies..."));
    try {
        // Install required packages
        (0, child_process_1.execSync)("pnpm add @nestjs/typeorm typeorm pg dotenv", { stdio: "inherit" });
        console.log(chalk_1.default.green("✔ PostgreSQL TypeORM dependencies installed successfully."));
        // Prompt user for database configuration
        console.log(chalk_1.default.yellow("\n🔧 Configure PostgreSQL Connection:"));
        const answers = yield inquirer_1.default.prompt([
            {
                type: "input",
                name: "databaseHost",
                message: "Enter database host:",
                default: "localhost",
            },
            {
                type: "input",
                name: "databasePort",
                message: "Enter database port:",
                default: "5432",
                validate: (input) => /^\d+$/.test(input) || "Port must be a number",
            },
            {
                type: "input",
                name: "databaseName",
                message: "Enter database name:",
                validate: (input) => input.trim() !== "" || "Database name is required",
            },
            {
                type: "input",
                name: "databaseUser",
                message: "Enter database user:",
                default: "postgres",
            },
            {
                type: "password",
                name: "databasePassword",
                message: "Enter database password:",
                mask: "*",
            },
            {
                type: "confirm",
                name: "databaseSSL",
                message: "Enable SSL?",
                default: false,
            },
            {
                type: "confirm",
                name: "databaseSync",
                message: "Enable synchronize mode?",
                default: false,
            },
            {
                type: "confirm",
                name: "databaseLogging",
                message: "Enable query logging?",
                default: false,
            },
        ]);
        // Ensure `src/modules/database/` exists
        const databaseModuleDir = path.join(process.cwd(), "src/modules/database");
        if (!fs.existsSync(databaseModuleDir)) {
            fs.mkdirSync(databaseModuleDir, { recursive: true });
        }
        // Ensure `src/config/` exists
        const configDir = path.join(process.cwd(), "src/config");
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        // Database module content
        const databaseModuleContent = `import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { databaseConfig } from '../../config/database.config';
  
  @Module({
    imports: [TypeOrmModule.forRoot(databaseConfig)],
    exports: [TypeOrmModule],
  })
  export class DatabaseModule {}`;
        fs.writeFileSync(path.join(databaseModuleDir, "database.module.ts"), databaseModuleContent);
        console.log(chalk_1.default.green("✔ TypeORM DatabaseModule created."));
        // Database config file content
        const databaseConfigContent = `import { TypeOrmModuleOptions } from '@nestjs/typeorm';
  import { getOsEnv } from '../config/env.config';
  
  export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: getOsEnv('DATABASE_HOST'),
    port: +getOsEnv('DATABASE_PORT'),
    username: getOsEnv('DATABASE_USER'),
    password: getOsEnv('DATABASE_PASSWORD'),
    database: getOsEnv('DATABASE_NAME'),
    ssl: ${answers.databaseSSL},
    synchronize: ${answers.databaseSync},
    logging: ${answers.databaseLogging},
    autoLoadEntities: true,
  };`;
        fs.writeFileSync(path.join(configDir, "database.config.ts"), databaseConfigContent);
        console.log(chalk_1.default.green("✔ Database config file created."));
        // Update `.env` file with user inputs
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
        const newEnvVariables = [
            `DATABASE_HOST=${answers.databaseHost}`,
            `DATABASE_PORT=${answers.databasePort}`,
            `DATABASE_NAME=${answers.databaseName}`,
            `DATABASE_USER=${answers.databaseUser}`,
            `DATABASE_PASSWORD=${answers.databasePassword}`,
            `DATABASE_SSL=${answers.databaseSSL}`,
            `DATABASE_SYNCHRONIZE=${answers.databaseSync}`,
            `DATABASE_LOGGING=${answers.databaseLogging}`,
        ];
        newEnvVariables.forEach((envVar) => {
            const [key] = envVar.split("=");
            if (!envContent.includes(key)) {
                envContent += `\n${envVar}`;
            }
        });
        fs.writeFileSync(envPath, envContent.trim());
        console.log(chalk_1.default.green("✔ .env file updated with database variables."));
        // Import DatabaseModule into AppModule
        const appModulePath = path.join(process.cwd(), "src/app.module.ts");
        let appModuleContent = fs.readFileSync(appModulePath, "utf8");
        if (!appModuleContent.includes("DatabaseModule")) {
            appModuleContent = appModuleContent.replace("@Module({", `import { DatabaseModule } from './modules/database/database.module';\n\n@Module({`);
            appModuleContent = appModuleContent.replace("imports: [", "imports: [DatabaseModule, ");
            fs.writeFileSync(appModulePath, appModuleContent);
            console.log(chalk_1.default.green("✔ DatabaseModule imported inside AppModule."));
        }
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Failed to setup PostgreSQL TypeORM."), error);
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    ensurePnpm();
    fixPnpmStore();
    ensureNestCLI();
    const projectName = yield createNestProject();
    if (projectName) {
        yield setupEnvFile(projectName);
        setupEnvConfigFile();
        setupConfigFile();
    }
    yield selectDatabase();
});
main();
