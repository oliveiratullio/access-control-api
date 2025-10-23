import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersRepositoryTypeorm } from 'src/infra/database/database/repositories/users.repository';
import { AccessLogService } from '../access-log.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepositoryTypeorm,
    private readonly jwtService: JwtService,
    private readonly accessLogService: AccessLogService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersRepo.findByEmail(email);
    if (!user || !pass) return null;
    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) return null;
    return user;
  }

  async login(email: string, pass: string, ip: string) {
    const user = await this.validateUser(email, pass);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    await this.accessLogService.record(user.id, user.email, ip);

    return { access_token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
