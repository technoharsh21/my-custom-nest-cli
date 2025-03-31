import { UserConfig } from "../types/inputTypes";
import { setupMongoDBWithoutTypeORM } from "./mongodb/setupMongoDBWithoutTypeORM";
import { setupMySQLWithoutTypeORM } from "./mysql/setupMySQLWithoutTypeORM";
import { setupPostgresWithoutTypeORM } from "./postgress/setupPostgresWithoutTypeORM";
import { setupMongoDBWithTypeORM } from "./typeorm/setupMongoDBWithTypeORM";
import { setupTypeORMMySQL } from "./typeorm/setupTypeORMmySql";
import { setupTypeORMPostgres } from "./typeorm/setupTypeORMPostgres";

export const setupDatabase = async (userConfig: UserConfig) => {
  const setupFunctions = {
    WithOrm: {
      PostgreSQL: setupTypeORMPostgres,
      MongoDB: setupMongoDBWithTypeORM,
      MySQL: setupTypeORMMySQL,
    },
    WithoutOrm: {
      PostgreSQL: setupPostgresWithoutTypeORM,
      MongoDB: setupMongoDBWithoutTypeORM,
      MySQL: setupMySQLWithoutTypeORM,
    },
  };

  const ormType = userConfig.useTypeORM ? "WithOrm" : "WithoutOrm";
  const setupFunction =
    setupFunctions[ormType][
      userConfig.database as keyof (typeof setupFunctions)[typeof ormType]
    ];

  if (setupFunction) {
    await setupFunction(userConfig);
  } else {
    throw new Error(`Unsupported database type: ${userConfig.database}`);
  }
};
