import { UserConfig } from "../types/inputTypes";
import { addModuleToAppModule } from "./userModule/addUserModule";
import * as path from "path";
import { createBaseEntity } from "./userModule/createBaseEntity";
import { createUserModule } from "./userModule/createUserModule";
import { createUserController } from "./userModule/createUserController";
import { createUserService } from "./userModule/createUserService";
import { createUserEntity } from "./userModule/createUserEntity";

export const addModule = async (userConfig: UserConfig) => {
  await addModuleToAppModule({
    appModulePath: path.join(process.cwd(), "src/app.module.ts"),
    moduleImportPath: `./modules/users/user.module`,
    moduleName: "UserModule",
  });

  createBaseEntity();
  createUserEntity();
  createUserModule();
  createUserController();
  createUserService();
};
