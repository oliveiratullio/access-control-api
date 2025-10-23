import { Injectable, BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UsersRepositoryTypeorm } from 'src/infra/database/database/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepositoryTypeorm) {}

  findAll() {
    return this.usersRepo.findAll();
  }

  findById(id: string) {
    return this.usersRepo.findById(id);
  }

  async createUser(name: string, email: string, password: string, role: 'admin'|'user' = 'user') {
    if (!password) {
      throw new BadRequestException('Password is required');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return this.usersRepo.save({ name, email, passwordHash, role });
  }
}
