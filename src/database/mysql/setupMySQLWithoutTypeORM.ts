import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

export const setupMySQLWithoutTypeORM = async () => {
  console.log(chalk.blue("📦 Installing MySQL dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add mysql2 dotenv", { stdio: "inherit" });
    console.log(chalk.green("✔ MySQL dependencies installed successfully."));

    // Prompt user for database configuration
    console.log(chalk.yellow("\n🔧 Configure MySQL Connection:"));

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
        default: "3306",
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
        default: "root",
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

    // Ensure `src/config/` exists
    const configDir = path.join(process.cwd(), "src/config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Database service content
    const databaseServiceContent = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

@Injectable()
export class MySQLService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ Connected to MySQL');
  }

  async query<T>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as T;
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🔴 Disconnected from MySQL');
  }
}`;

    fs.writeFileSync(
      path.join(databaseModuleDir, "mysql.service.ts"),
      databaseServiceContent
    );
    console.log(chalk.green("✔ MySQLService created."));

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

    // Import MySQLService into AppModule
    const appModulePath = path.join(process.cwd(), "src/app.module.ts");
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    if (!appModuleContent.includes("MySQLService")) {
      appModuleContent = appModuleContent.replace(
        "@Module({",
        `import { MySQLService } from './modules/database/mysql.service';\n\n@Module({`
      );
      appModuleContent = appModuleContent.replace(
        "providers: [",
        "providers: [MySQLService, "
      );
      appModuleContent = appModuleContent.replace(
        "exports: [",
        "exports: [MySQLService, "
      );
      fs.writeFileSync(appModulePath, appModuleContent);
      console.log(chalk.green("✔ MySQLService imported inside AppModule."));
    }
  } catch (error) {
    console.log(chalk.red("❌ Failed to setup MySQL without TypeORM."), error);
  }
};
