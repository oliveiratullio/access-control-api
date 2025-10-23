import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/User.entity';


@Injectable()
export class UsersRepositoryTypeorm {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  save(user: Partial<UserEntity>) {
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }
}
