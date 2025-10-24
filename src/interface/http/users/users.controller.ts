import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/application/access-log/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/application/access-log/users/users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserEntity } from 'src/infra/database/entities/User.entity';


type SafeUser = Omit<UserEntity, 'passwordHash'>;
interface AuthenticatedRequest { user: { userId: string } }


@ApiTags('users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest): Promise<SafeUser | null> {
    const userId = req.user.userId;
    console.log('User ID from token:', userId);
    const me = await this.usersService.findById(userId);
    console.log('User found:', me);
    if (!me) return null;
    const { passwordHash, ...safe } = me;
    return safe;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async list(): Promise<SafeUser[]> {
    const users = await this.usersService.findAll();
    return users.map((u: UserEntity): SafeUser => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateUserDto): Promise<SafeUser> {
    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }
    const created = await this.usersService.createUser(
      dto.name,
      dto.email,
      dto.password,
      dto.role ?? 'user',
    );
    const { passwordHash, ...safe } = created;
    return safe;
  }
}
