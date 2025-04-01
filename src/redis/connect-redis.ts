import { createRedisConfig } from "./add-redis-config";
import { addRedisImports } from "./add-redis-imports";

export const connectRedis = async ({
  projectName,
}: {
  projectName: string;
}) => {
  addRedisImports({ projectName });
  createRedisConfig({ projectName });
};
