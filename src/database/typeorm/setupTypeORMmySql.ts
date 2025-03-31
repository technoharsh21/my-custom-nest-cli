import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import { DatabaseConfigTypes } from "../envTypes";
import { updateEnvFile } from "../../utills/envUpdate";

export const setupTypeORMMySQL = async ({
  databaseHost,
  databasePort,
  databaseName,
  databaseUser,
  databasePassword,
  databaseSSL,
  databaseSync,
  databaseLogging,
}: DatabaseConfigTypes) => {
  console.log(chalk.blue("📦 Installing MySQL & TypeORM dependencies..."));

  try {
    // Install required packages
    execSync("pnpm add @nestjs/typeorm typeorm mysql2 dotenv", {
      stdio: "inherit",
    });
    console.log(
      chalk.green("✔ MySQL TypeORM dependencies installed successfully.")
    );

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
        type: 'mysql',
        host: getOsEnv('DATABASE_HOST'),
        port: +getOsEnv('DATABASE_PORT'),
        username: getOsEnv('DATABASE_USER'),
        password: getOsEnv('DATABASE_PASSWORD'),
        database: getOsEnv('DATABASE_NAME'),
        synchronize: getOsEnv('DATABASE_SYNCHRONIZE'),
        logging: getOsEnv('DATABASE_LOGGING'),
        autoLoadEntities: true,
      };`;

    fs.writeFileSync(
      path.join(configDir, "database.config.ts"),
      databaseConfigContent
    );
    console.log(chalk.green("✔ Database config file created."));

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
      chalk.green("✔ MySQL environment variables updated in .env file.")
    );

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
    console.log(chalk.red("❌ Failed to setup MySQL TypeORM."), error);
  }
};
