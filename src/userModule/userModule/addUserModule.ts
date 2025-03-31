import * as fs from "fs";
import * as path from "path";
import { UserModuleConfig } from "./types";

export const addModuleToAppModule = async ({
  moduleName,
  moduleImportPath,
  appModulePath,
}: UserModuleConfig) => {
  let content = fs.readFileSync(appModulePath, "utf8");

  // Check if the module is already imported
  if (content.includes(moduleName)) {
    console.log(`${moduleName} is already imported.`);
    return;
  }

  // Add the import statement
  const importStatement = `import { ${moduleName} } from '${moduleImportPath}';\n`;
  content = importStatement + content;

  // Modify the @Module imports array
  content = content.replace(
    /imports:\s*\[\s*([\s\S]*?)\s*\]/,
    (match, imports) => {
      const updatedImports = imports.trim()
        ? `${imports}, ${moduleName}`
        : moduleName;
      return `imports: [${updatedImports}]`;
    }
  );

  fs.writeFileSync(appModulePath, content, "utf8");
  console.log(`${moduleName} has been added to AppModule.`);
};
