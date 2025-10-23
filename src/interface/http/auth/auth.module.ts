import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessLogModule } from '../access-log/access-log.module';

import { AuthService } from 'src/application/access-log/auth/auth.service';
import { LocalStrategy } from 'src/application/access-log/auth/strategies/local.strategy';
import { JwtStrategy } from 'src/application/access-log/auth/strategies/jwt.strategy';
import { UsersModule } from 'src/application/access-log/users/users.module';
import { AuthController } from './auth.controller';


@Module({
  imports: [
    UsersModule,
    AccessLogModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
