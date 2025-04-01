import * as fs from "fs";
import * as path from "path";

export const createSwaggerConstants = () => {
  const constantsDir = path.join(process.cwd(), "src", "constants");
  const constantsFilePath = path.join(constantsDir, "app-constants.ts");

  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }

  console.log("📝 Checking Swagger constants file...");

  let fileContent = "";
  if (fs.existsSync(constantsFilePath)) {
    fileContent = fs.readFileSync(constantsFilePath, "utf8");

    // Check if swaggerInfo already exists
    if (fileContent.includes("swaggerInfo")) {
      console.log(
        "⚠️ swaggerInfo already exists in app-constants.ts, skipping addition."
      );
      return;
    }
  }

  console.log("📌 Appending Swagger constants to app-constants.ts...");

  const constantsContent = `\nexport const swaggerInfo = {
  title: "NEST Boilerplate Api Documentation",
  description: "Boilerplate of NEST project Api Documentation to test and review APIs",
};`;

  // Append the new constant to the file
  fs.writeFileSync(constantsFilePath, fileContent + constantsContent, "utf8");

  console.log("✅ Swagger constants added to src/constants/app-constants.ts");
};
