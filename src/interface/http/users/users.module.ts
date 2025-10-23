import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/infra/database/entities/User.entity';
import { UsersService } from 'src/application/access-log/users/users.service';
import { UsersRepositoryTypeorm } from 'src/infra/database/database/repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UsersRepositoryTypeorm, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService, UsersRepositoryTypeorm],
})
export class UsersModule {}
