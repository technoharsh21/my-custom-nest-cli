import { join } from "path";
import * as fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";

// Function to get the path to app.module.ts dynamically based on the provided project name
const getAppModulePath = (projectName: string) => {
  // Resolving the project path based on the project name
  const projectPath = join(process.cwd()); // Assuming the project folder is inside the current working directory
  const appModulePath = join(projectPath, "src", "app.module.ts");

  if (!fs.existsSync(appModulePath)) {
    console.log(chalk.red(`❌ app.module.ts not found at: ${appModulePath}`));
    process.exit(1); // Exit if the file doesn't exist
  }

  return appModulePath;
};

// Function to install necessary dependencies
const installDependencies = () => {
  try {
    // Run the install command using the system package manager (pnpm, yarn, or npm)
    console.log(chalk.blue("🔄 Installing required dependencies..."));

    execSync("pnpm add @liaoliaots/nestjs-redis redis", { stdio: "inherit" });

    console.log(chalk.green("✅ Successfully installed Redis dependencies."));
  } catch (error) {
    console.log(
      chalk.red(
        "❌ Failed to install dependencies. Please check the error above."
      )
    );
    process.exit(1);
  }
};

export const addRedisImports = ({ projectName }: { projectName: string }) => {
  const projectPath = getAppModulePath(projectName);
  let appModuleContent = fs.readFileSync(projectPath, "utf8");

  installDependencies();

  if (!appModuleContent.includes("RedisModule")) {
    console.log(chalk.blue("🔄 Adding RedisModule to AppModule..."));

    // Ensure RedisModule is added before the closing bracket of imports: []
    appModuleContent = appModuleContent.replace(
      /imports:\s*\[([\s\S]*?)\]/,
      (match, existingImports) => {
        return `imports: [${existingImports.trim()},\n    RedisModule.forRoot({\n      readyLog: true,\n      config: {\n        ...redisConfig,\n      },\n    })\n  ]`;
      }
    );

    // Add the necessary imports at the top
    if (
      !appModuleContent.includes(
        "import { RedisModule } from '@liaoliaots/nestjs-redis';"
      )
    ) {
      appModuleContent = `import { RedisModule } from '@liaoliaots/nestjs-redis';\n${appModuleContent}`;
    }

    if (
      !appModuleContent.includes(
        "import { redisConfig } from './config/redis-config';"
      )
    ) {
      appModuleContent = `import { redisConfig } from './config/redis-config';\n${appModuleContent}`;
    }

    fs.writeFileSync(projectPath, appModuleContent, "utf8");
    console.log(chalk.green("✅ Successfully added RedisModule to AppModule."));
  } else {
    console.log(
      chalk.yellow("⚠️ RedisModule is already imported in AppModule.")
    );
  }
};
