import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const createUserController = () => {
  const directory = path.join(process.cwd(), 'src', 'modules', 'users');
  const filePath = path.join(directory, 'user.controller.ts');

  const content = `
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() user: Partial<UserEntity>): Promise<UserEntity> {
    return this.userService.create(user);
  }

  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity | null> {
    return this.userService.findOne(id);
  }
}
`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write the content to the user.controller.ts file
  fs.writeFileSync(filePath, content, 'utf-8');

  // Console success message using chalk
  console.log(
    chalk.green.bold('user.controller.ts has been created successfully in src/modules/users!')
  );
};

export { createUserController };
