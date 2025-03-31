import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export const createBaseEntity = () => {
  const directory = path.join(process.cwd(), "src", "modules", "database");
  const filePath = path.join(directory, "base-entity.ts");

  const content = `
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import type { UserEntity } from "../users/user.entity";

export class BaseEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @ManyToOne("UserEntity", { nullable: true })
  @JoinColumn({ name: "createdBy" })
  creator?: UserEntity;

  @Column({ nullable: true })
  updatedBy?: string;

  @ManyToOne("UserEntity", { nullable: true })
  @JoinColumn({ name: "updatedBy" })
  updater?: UserEntity;
}
`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write the content to the base-entity.ts file
  fs.writeFileSync(filePath, content, "utf-8");

  // Console success message using chalk
  console.log(
    chalk.green.bold(
      "base-entity.ts has been created successfully in src/modules/database!"
    )
  );
};
