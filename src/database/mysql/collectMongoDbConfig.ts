import inquirer from "inquirer";

export const collectMongoDbConfig = async () => {
  return await inquirer.prompt([
    {
      type: "input",
      name: "databaseUri",
      message: "Enter database URI:",
      default: "mongodb://localhost:27017/mydatabase",
    },
  ]);
};
