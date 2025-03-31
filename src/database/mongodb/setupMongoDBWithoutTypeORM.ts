import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

export const setupMongoDBWithoutTypeORM = async () => {
  console.log(chalk.blue("📦 Installing MongoDB dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add mongoose dotenv", { stdio: "inherit" });
    console.log(chalk.green("✔ MongoDB dependencies installed successfully."));

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

    // Database service content
    const databaseServiceContent = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await mongoose.connect(process.env.DATABASE_URI || '');
    console.log('✅ Connected to MongoDB');
  }

  async onModuleDestroy() {
    await mongoose.disconnect();
    console.log('🔴 Disconnected from MongoDB');
  }
}`;

    fs.writeFileSync(
      path.join(databaseModuleDir, "mongodb.service.ts"),
      databaseServiceContent
    );
    console.log(chalk.green("✔ MongoDBService created."));

    // Update `.env` file with user inputs
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const newEnvVariable = `DATABASE_URI=${answers.databaseUri}`;
    if (!envContent.includes("DATABASE_URI")) {
      envContent += `\n${newEnvVariable}`;
    }

    fs.writeFileSync(envPath, envContent.trim());
    console.log(chalk.green("✔ .env file updated with database URI."));

    // Import MongoDBService into AppModule
    const appModulePath = path.join(process.cwd(), "src/app.module.ts");
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    if (!appModuleContent.includes("MongoDBService")) {
      appModuleContent = appModuleContent.replace(
        "@Module({",
        `import { MongoDBService } from './modules/database/mongodb.service';\n\n@Module({`
      );
      appModuleContent = appModuleContent.replace(
        "providers: [",
        "providers: [MongoDBService, "
      );
      appModuleContent = appModuleContent.replace(
        "exports: [",
        "exports: [MongoDBService, "
      );
      fs.writeFileSync(appModulePath, appModuleContent);
      console.log(chalk.green("✔ MongoDBService imported inside AppModule."));
    }
  } catch (error) {
    console.log(chalk.red("❌ Failed to setup MongoDB without TypeORM."), error);
  }
};
