import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

export const setupMongoDBWithTypeORM = async () => {
  console.log(chalk.blue("📦 Installing MongoDB & TypeORM dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add @nestjs/typeorm typeorm mongodb dotenv", { stdio: "inherit" });
    console.log(chalk.green("✔ MongoDB TypeORM dependencies installed successfully."));

    // Prompt user for database configuration
    console.log(chalk.yellow("\n🔧 Configure MongoDB Connection:"));

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "databaseUri",
        message: "Enter MongoDB connection URI:",
        default: "mongodb://localhost:27017/mydatabase",
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
export class DatabaseModule {};`;

    fs.writeFileSync(
      path.join(databaseModuleDir, "database.module.ts"),
      databaseModuleContent
    );
    console.log(chalk.green("✔ TypeORM DatabaseModule created."));

    // Database config file content
    const databaseConfigContent = `import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getOsEnv } from '../config/env.config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: getOsEnv('DATABASE_URI'),
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  autoLoadEntities: true,
};`;

    fs.writeFileSync(
      path.join(configDir, "database.config.ts"),
      databaseConfigContent
    );
    console.log(chalk.green("✔ Database config file created."));

    // Update `.env` file with user inputs
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const newEnvVariable = `DATABASE_URI=${answers.databaseUri}`;
    if (!envContent.includes("DATABASE_URI")) {
      envContent += `\n${newEnvVariable}`;
    }

    fs.writeFileSync(envPath, envContent.trim());
    console.log(chalk.green("✔ .env file updated with database URI."));

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
    console.log(chalk.red("❌ Failed to setup MongoDB with TypeORM."), error);
  }
};
