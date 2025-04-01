import * as fs from "fs";
import { join } from "path";
import chalk from "chalk";

interface CreateRedisConfigProps {
  projectName: string;
}

export const createRedisConfig = ({ projectName }: CreateRedisConfigProps) => {
  // Dynamically generate the file path for redis-config.ts
  const redisConfigPath = join(
    process.cwd(),
    "src",
    "config",
    "redis-config.ts"
  );
  console.log("🚀 ~ createRedisConfig ~ redisConfigPath:", redisConfigPath);

  const redisConfigContent = `// ${projectName}/src/config/redis-config.ts

import { getOsEnvOptional } from '../config/env.config'; // Assuming this function is already defined

export const redisConfig = {
  port: +(getOsEnvOptional("REDIS_PORT") ?? 6379),
  host: getOsEnvOptional("REDIS_HOST") ?? "localhost",
  password: getOsEnvOptional("REDIS_PASSWORD"),
};
`;

  // Check if the file already exists, if not, create it
  if (!fs.existsSync(redisConfigPath)) {
    fs.writeFileSync(redisConfigPath, redisConfigContent, "utf8");
    console.log(
      chalk.green(`✅ ${projectName}/src/config/redis-config.ts file created.`)
    );
  } else {
    console.log(
      chalk.yellow(
        `⚠️ ${projectName}/src/config/redis-config.ts already exists.`
      )
    );
  }
}
