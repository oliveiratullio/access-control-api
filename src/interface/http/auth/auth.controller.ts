import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/application/access-log/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from 'src/application/access-log/auth/guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AccessLogService } from 'src/application/access-log/access-log.service';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly accessLogService: AccessLogService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  async login(@Req() req) {
    const user = req.user;
    const ip =
      req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() ??
      req.ip ??
      req.connection?.remoteAddress ??
      'unknown';

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    await this.accessLogService.record(user.id, user.email, ip);

    return { 
      access_token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    };
  }
}
