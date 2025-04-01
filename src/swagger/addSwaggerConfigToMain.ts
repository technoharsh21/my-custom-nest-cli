import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Function to add Swagger configuration to main.ts
 */
export const addSwaggerConfigToMain = () => {
  console.log("🚀 Installing Swagger dependencies...");
  execSync("pnpm add @nestjs/swagger swagger-ui-express", { stdio: "inherit" });

  const mainTsPath = path.join(process.cwd(), "src", "main.ts");
  let mainTsContent = fs.readFileSync(mainTsPath, "utf8");

  // Check if Swagger is already configured
  if (mainTsContent.includes("SwaggerModule.setup")) {
    console.log("✅ Swagger is already configured in main.ts");
    return;
  }

  console.log("🛠️ Adding Swagger configuration to main.ts...");

  // Define Swagger imports
  const swaggerImport = `import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';\nimport { swaggerInfo } from './constants/app-constants';`;

  // Define Swagger setup code
  const swaggerSetup = `
  const config = new DocumentBuilder()
    .setTitle(swaggerInfo.title)
    .setDescription(swaggerInfo.description)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  `;

  // Ensure imports exist at the top
  if (!mainTsContent.includes("DocumentBuilder")) {
    mainTsContent = mainTsContent.replace(
      /(import { NestFactory .*? from '@nestjs\/core';)/,
      `$1\n${swaggerImport}`
    );
  }

  // Find the `await app.listen(...)` line and insert before it
  const listenRegex = /(await app\.listen\(.*?\);)/;
  if (listenRegex.test(mainTsContent)) {
    mainTsContent = mainTsContent.replace(listenRegex, `${swaggerSetup}\n  $1`);
  } else {
    console.error("❌ Could not find 'await app.listen(...)' in main.ts.");
    return;
  }

  // Write updated content back
  fs.writeFileSync(mainTsPath, mainTsContent, "utf8");

  console.log("✅ Swagger setup added to main.ts");
  console.log(
    "🎉 Swagger setup complete! Run `pnpm start` and visit http://localhost:3000/api-docs`"
  );
};
