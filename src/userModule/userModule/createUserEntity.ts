import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export const createUserEntity = () => {
  const directory = path.join(process.cwd(), "src", "modules", "users");
  const filePath = path.join(directory, "user.entity.ts");

  const content = `
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../database/base-entity';

@Entity()
export class UserEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write the content to the user.entity.ts file
  fs.writeFileSync(filePath, content, "utf-8");

  // Console success message using chalk
  console.log(
    chalk.green.bold(
      "user.entity.ts has been created successfully in src/modules/users!"
    )
  );
};
