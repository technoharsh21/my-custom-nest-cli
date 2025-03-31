import * as path from "path";
import * as fs from "fs";

export const updateEnvFile = (
  newVariables: Record<string, string | boolean | number>
) => {
  const envPath = path.join(process.cwd(), ".env");
  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  let updatedEnvContent = envContent;

  for (const [key, value] of Object.entries(newVariables)) {
    const stringValue = String(value); // Ensure all values are stored as strings
    const regex = new RegExp(`^${key}=.*`, "m");

    if (envContent.match(regex)) {
      // Replace existing key-value pair
      updatedEnvContent = updatedEnvContent.replace(
        regex,
        `${key}=${stringValue}`
      );
    } else {
      // Append new key-value pair
      updatedEnvContent += `\n${key}=${stringValue}`;
    }
  }

  fs.writeFileSync(envPath, updatedEnvContent.trim());
};
