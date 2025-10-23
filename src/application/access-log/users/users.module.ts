import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/infra/database/entities/User.entity';
import { UsersService } from './users.service';
import { UsersRepositoryTypeorm } from 'src/infra/database/database/repositories/users.repository';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UsersRepositoryTypeorm],
  exports: [UsersService, UsersRepositoryTypeorm],
})
export class UsersModule {}
