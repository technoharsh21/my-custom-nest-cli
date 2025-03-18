/**
 * Installs PostgreSQL dependencies and sets up TypeORM inside `src/modules/database/`.
 */

import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

export const setupTypeORMPostgres = async () => {
  console.log(chalk.blue("📦 Installing PostgreSQL & TypeORM dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add @nestjs/typeorm typeorm pg dotenv", {
      stdio: "inherit",
    });
    console.log(
      chalk.green("✔ PostgreSQL TypeORM dependencies installed successfully.")
    );

    // Prompt user for database configuration
    console.log(chalk.yellow("\n🔧 Configure PostgreSQL Connection:"));

    const answers = await inquirer.prompt([
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

    fs.writeFileSync(
      path.join(databaseModuleDir, "database.module.ts"),
      databaseModuleContent
    );
    console.log(chalk.green("✔ TypeORM DatabaseModule created."));

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

    fs.writeFileSync(
      path.join(configDir, "database.config.ts"),
      databaseConfigContent
    );
    console.log(chalk.green("✔ Database config file created."));

    // Update `.env` file with user inputs
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf8")
      : "";

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
    console.log(chalk.green("✔ .env file updated with database variables."));

    // Import DatabaseModule into AppModule
    const appModulePath = path.join(process.cwd(), "src/app.module.ts");
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    if (!appModuleContent.includes("DatabaseModule")) {
      appModuleContent = appModuleContent.replace(
        "@Module({",
        `import { DatabaseModule } from './modules/database/database.module';\n\n@Module({`
      );
      appModuleContent = appModuleContent.replace(
        "imports: [",
        "imports: [DatabaseModule, "
      );
      fs.writeFileSync(appModulePath, appModuleContent);
      console.log(chalk.green("✔ DatabaseModule imported inside AppModule."));
    }
  } catch (error) {
    console.log(chalk.red("❌ Failed to setup PostgreSQL TypeORM."), error);
  }
};
