import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './interface/http/users/users.module';
import { AccessLogModule } from './interface/http/access-log/access-log.module';
import { AuthModule } from './interface/http/auth/auth.module';
import { AppDataSource } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    AccessLogModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
