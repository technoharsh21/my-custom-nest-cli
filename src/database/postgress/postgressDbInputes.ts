import inquirer from "inquirer";

export const collectPostgresConfig = async () => {
  return await inquirer.prompt([
    {
      type: "input",
      name: "databaseHost",
      message: "Enter database host:",
      default: "localhost",
    },
    {
      type: "input",
      name: "databasePort",
      message: "Enter database port:",
      default: "5432",
      validate: (input) => /^\d+$/.test(input) || "Port must be a number",
    },
    {
      type: "input",
      name: "databaseName",
      message: "Enter database name:",
      validate: (input) => input.trim() !== "" || "Database name is required",
    },
    {
      type: "input",
      name: "databaseUser",
      message: "Enter database user:",
      default: "postgres",
    },
    {
      type: "password",
      name: "databasePassword",
      message: "Enter database password:",
      mask: "*",
    },
    {
      type: "confirm",
      name: "databaseSSL",
      message: "Enable SSL?",
      default: false,
    },
    {
      type: "confirm",
      name: "databaseSync",
      message: "Enable synchronize mode?",
      default: false,
    },
    {
      type: "confirm",
      name: "databaseLogging",
      message: "Enable query logging?",
      default: false,
    },
  ]);
};
