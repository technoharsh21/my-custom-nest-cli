export interface UserConfig {
  projectName: string;
  PORT: string;
  ENVIRONMENT: string;
  database: string;
  useTypeORM: boolean;
  useSonarQube: boolean;
  sonarServerUrl: string;
  sonarToken: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  databaseSSL: boolean;
  databaseSync: boolean;
  databaseUri: string;
  databaseLogging: boolean;
  addDocker: boolean;
  addUserModule: boolean;
  addRedis: boolean;
}
