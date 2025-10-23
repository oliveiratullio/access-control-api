import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessLogService } from '../../../application/access-log/access-log.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/application/access-log/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessLogEntity } from 'src/infra/database/entities/AcessLog.entity';


@ApiTags('access-logs')
@ApiBearerAuth('bearer')
@Controller('access-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AccessLogController {
  constructor(
    private readonly logsService: AccessLogService,
    @InjectRepository(AccessLogEntity) private readonly repo: Repository<AccessLogEntity>,
  ) {}

  @Get()
  async list() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
