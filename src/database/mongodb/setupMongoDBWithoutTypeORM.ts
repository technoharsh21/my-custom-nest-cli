import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import { updateEnvFile } from "../../utills/envUpdate";

export const setupMongoDBWithoutTypeORM = async ({
  databaseUri,
}: {
  databaseUri: string;
}) => {
  console.log(chalk.blue("📦 Installing MongoDB dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add mongoose dotenv", { stdio: "inherit" });
    console.log(chalk.green("✔ MongoDB dependencies installed successfully."));

    // Prompt user for database configuration
    console.log(chalk.yellow("\n🔧 Configure MongoDB Connection:"));

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
    updateEnvFile({
      DATABASE_URI: databaseUri,
    });

    console.log(
      chalk.green("✔ MongoDB environment variables updated in .env file.")
    );

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
    console.log(
      chalk.red("❌ Failed to setup MongoDB without TypeORM."),
      error
    );
  }
};
