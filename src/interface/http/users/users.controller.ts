import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/application/access-log/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/application/access-log/users/users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from '../auth/dto/create-user.dto';


@ApiTags('users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.userId;
    console.log('User ID from token:', userId);
    const me = await this.usersService.findById(userId);
    console.log('User found:', me);
    if (me) delete (me as any).passwordHash;
    return me;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async list() {
    const users = await this.usersService.findAll();
    return users.map(u => {
      const { passwordHash, ...safe } = u as any;
      return safe;
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateUserDto) {
    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }
    const created = await this.usersService.createUser(
      dto.name,
      dto.email,
      dto.password,
      dto.role ?? 'user',
    );
    const { passwordHash, ...safe } = created as any;
    return safe;
  }
}
