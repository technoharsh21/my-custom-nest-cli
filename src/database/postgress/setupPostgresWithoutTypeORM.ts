import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import { DatabaseConfigTypes } from "../envTypes";
import { updateEnvFile } from "../../utills/envUpdate";

export const setupPostgresWithoutTypeORM = async ({
  databaseHost,
  databasePort,
  databaseName,
  databaseUser,
  databasePassword,
  databaseSSL,
  databaseSync,
  databaseLogging,
}: DatabaseConfigTypes) => {
  console.log(chalk.blue("📦 Installing PostgreSQL dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add pg dotenv", { stdio: "inherit" });
    console.log(
      chalk.green("✔ PostgreSQL dependencies installed successfully.")
    );

    // Prompt user for database configuration
    console.log(chalk.yellow("\n🔧 Configure PostgreSQL Connection:"));

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

    updateEnvFile({
      DATABASE_HOST: databaseHost,
      DATABASE_PORT: databasePort,
      DATABASE_NAME: databaseName,
      DATABASE_USER: databaseUser,
      DATABASE_PASSWORD: databasePassword,
      DATABASE_SSL: databaseSSL,
      DATABASE_SYNCHRONIZE: databaseSync,
      DATABASE_LOGGING: databaseLogging,
    });

    console.log(
      chalk.green("✔ PostgreSQL environment variables updated in .env file.")
    );

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
