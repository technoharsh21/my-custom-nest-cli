import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import * as path from "path";
import * as fs from "fs";

export const setupESLintPrettier = () => {
  console.log(chalk.blue("📦 Installing ESLint & Prettier..."));

  try {
    // Install ESLint, Prettier, and necessary plugins with exact versions
    execSync(
      "pnpm add -D eslint@~8.48.0 @typescript-eslint/parser@^5.62.0 @typescript-eslint/eslint-plugin@^5.62.0 eslint-config-prettier@^9.1.0 eslint-plugin-import@^2.31.0 eslint-plugin-prettier@^5.2.1 eslint-plugin-unused-imports@^4.1.4 prettier",
      { stdio: "inherit" }
    );
    console.log(chalk.green("✔ ESLint & Prettier installed successfully."));

    // Create `.eslintrc.js` configuration
    const eslintConfig = `const isLocal = process.env.NODE_ENV === "development";
    
    module.exports = {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
      },
      plugins: ["@typescript-eslint/eslint-plugin", "unused-imports", "import"],
      extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
      root: true,
      env: {
        node: true,
        jest: true,
      },
      ignorePatterns: [".eslintrc.js", "**/*.d.ts"],
      rules: {
        "import/newline-after-import": ["error"],
        "import/extensions": "off",
        "import/prefer-default-export": "off",
        "import/no-extraneous-dependencies": "off",
        "no-duplicate-imports": "error",
        "@typescript-eslint/no-explicit-any": isLocal ? "warn" : "error",
        "@typescript-eslint/no-shadow": "warn",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-loop-func": "warn",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/ban-types": ["error"],
        "@typescript-eslint/no-use-before-define": "warn",
        "import/order": [
          "error",
          {
            pathGroups: [
              {
                pattern: "~/**",
                group: "external",
                position: "after",
              },
            ],
            groups: ["external", "internal", "unknown", "index", "object", "type", "builtin", "sibling", "parent"],
          },
        ],
        "no-console": "error",
        "no-var": "error",
        "no-nested-ternary": "warn",
        "no-unneeded-ternary": "warn",
        "no-empty-pattern": "error",
        "no-restricted-exports": "off",
        "object-shorthand": "error",
        "prefer-destructuring": "warn",
        "camelcase": "warn",
        "max-params": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "error",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: false,
          },
        ],
      },
    };`;

    fs.writeFileSync(path.join(process.cwd(), ".eslintrc.js"), eslintConfig);
    console.log(chalk.green("✔ ESLint configuration created."));

    // Create `.eslintignore` configuration
    const eslintIgnore = `node_modules
    dangerfile.js
    spell-check.js
    dist
    src/migrations`;

    fs.writeFileSync(path.join(process.cwd(), ".eslintignore"), eslintIgnore);
    console.log(chalk.green("✔ ESLint ignore file created."));

    // Add lint script to `package.json`
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    packageJson.scripts = {
      ...packageJson.scripts,
      lint: "eslint --fix .",
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green("✔ Added lint script to package.json."));
  } catch (error) {
    console.log(chalk.red("❌ Failed to setup ESLint & Prettier."), error);
  }
};
