import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Function to install dependencies and modify main.ts
export const setupClassValidator = () => {
  // Step 1: Install dependencies
  console.log("Installing class-validator and class-transformer...");
  try {
    execSync("pnpm add class-validator class-transformer", {
      stdio: "inherit",
    });
    console.log("Dependencies installed successfully.");
  } catch (error) {
    console.error("Error installing dependencies:", error);
    return;
  }

  // Step 2: Modify main.ts to include ValidationPipe setup before app.listen
  const mainFilePath = path.join(process.cwd(), "src", "main.ts");

  if (fs.existsSync(mainFilePath)) {
    let mainFileContent = fs.readFileSync(mainFilePath, "utf8");

    // Step 3: Add the import statement at the very top of the file
    const importStatement = "import { ValidationPipe } from '@nestjs/common';\n";

    // Add the import statement at the beginning of the file
    const updatedContent = importStatement + mainFileContent;
    fs.writeFileSync(mainFilePath, updatedContent, "utf8");
    console.log("ValidationPipe import added to main.ts.");

    mainFileContent = fs.readFileSync(mainFilePath, "utf8");
    // Step 4: Insert the app.useGlobalPipes line before app.listen
    const listenIndex = mainFileContent.indexOf("await app.listen(process.env.PORT ?? 3000);");

    if (listenIndex !== -1) {
      // Insert the app.useGlobalPipes(new ValidationPipe()); line before app.listen
      let updatedContent =
        mainFileContent.slice(0, listenIndex) +
        "  app.useGlobalPipes(new ValidationPipe());\n" +
        mainFileContent.slice(listenIndex);

      fs.writeFileSync(mainFilePath, updatedContent, "utf8");
      console.log("main.ts updated to enable global validation before app.listen.");
    } else {
      console.error("Could not find app.listen() line in main.ts.");
    }
  } else {
    console.error("main.ts file not found.");
  }
};
