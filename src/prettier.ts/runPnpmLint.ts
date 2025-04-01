import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

/**
 * Changes to the project folder and runs `pnpm lint` in that folder.
 * @param projectName The name of the project folder to move into.
 */
function cdToProjectAndLint(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName);

  // Check if the project folder exists
  if (fs.existsSync(projectPath)) {
    try {
      // Change the current working directory to the project folder
      process.chdir(projectPath);

      console.log(`Changed to project folder: ${projectPath}`);

      // Run `pnpm lint` in the project folder
      console.log("Running pnpm lint...");
      execSync("pnpm lint", { stdio: "inherit" });
    } catch (error) {
      console.error("Failed to run pnpm lint:", error);
    }
  } else {
    console.error(`The folder ${projectName} does not exist.`);
  }
}
