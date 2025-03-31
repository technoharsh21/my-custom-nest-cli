import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const createUserModule = () => {
  const directory = path.join(process.cwd(), 'src', 'modules', 'users');
  const filePath = path.join(directory, 'user.module.ts');

  const content = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write the content to the user.module.ts file
  fs.writeFileSync(filePath, content, 'utf-8');

  // Console success message using chalk
  console.log(
    chalk.green.bold('user.module.ts has been created successfully in src/modules/users!')
  );
};

export { createUserModule };
