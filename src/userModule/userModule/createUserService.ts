import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const createUserService = () => {
  const directory = path.join(process.cwd(), 'src', 'modules', 'users');
  const filePath = path.join(directory, 'user.service.ts');

  const content = `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write the content to the user.service.ts file
  fs.writeFileSync(filePath, content, 'utf-8');

  // Console success message using chalk
  console.log(
    chalk.green.bold('user.service.ts has been created successfully in src/modules/users!')
  );
};

export { createUserService };
