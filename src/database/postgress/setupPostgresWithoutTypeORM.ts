import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

export const setupPostgresWithoutTypeORM = async () => {
  console.log(chalk.blue("📦 Installing PostgreSQL dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add pg dotenv", { stdio: "inherit" });
    console.log(
      chalk.green("✔ PostgreSQL dependencies installed successfully.")
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
    ]);

    // Ensure `src/modules/database/` exists
    const databaseModuleDir = path.join(process.cwd(), "src/modules/database");
    if (!fs.existsSync(databaseModuleDir)) {
      fs.mkdirSync(databaseModuleDir, { recursive: true });
    }

    // Database service content
    const databaseServiceContent = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { config } from 'dotenv';
config();

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('✅ Connected to PostgreSQL');
  }

  async query<T>(text: string, params?: any[]): Promise<T> {
    const { rows } = await this.pool.query(text, params);
    return rows as T;
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🔴 Disconnected from PostgreSQL');
  }
}`;

    fs.writeFileSync(
      path.join(databaseModuleDir, "postgres.service.ts"),
      databaseServiceContent
    );
    console.log(chalk.green("✔ PostgresService created."));

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
    ];

    newEnvVariables.forEach((envVar) => {
      const [key] = envVar.split("=");
      if (!envContent.includes(key)) {
        envContent += `\n${envVar}`;
      }
    });

    fs.writeFileSync(envPath, envContent.trim());
    console.log(chalk.green("✔ .env file updated with database variables."));

    // Import PostgresService into AppModule
    const appModulePath = path.join(process.cwd(), "src/app.module.ts");
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    if (!appModuleContent.includes("PostgresService")) {
      appModuleContent = appModuleContent.replace(
        "@Module({",
        `import { PostgresService } from './modules/database/postgres.service';\n\n@Module({`
      );
      appModuleContent = appModuleContent.replace(
        "providers: [",
        "providers: [PostgresService, "
      );
      appModuleContent = appModuleContent.replace(
        "exports: [",
        "exports: [PostgresService, "
      );
      fs.writeFileSync(appModulePath, appModuleContent);
      console.log(chalk.green("✔ PostgresService imported inside AppModule."));
    }
  } catch (error) {
    console.log(
      chalk.red("❌ Failed to setup PostgreSQL without TypeORM."),
      error
    );
  }
};
