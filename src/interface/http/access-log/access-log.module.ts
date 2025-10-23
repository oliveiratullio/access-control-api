import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLogService } from 'src/application/access-log/access-log.service';
import { AccessLogRepositoryTypeorm } from 'src/infra/database/database/repositories/access-log.repository';
import { AccessLogEntity } from 'src/infra/database/entities/AcessLog.entity';
import { AccessLogController } from './access-log.controller';


@Module({
  imports: [TypeOrmModule.forFeature([AccessLogEntity])],
  controllers: [AccessLogController],
  providers: [AccessLogService, AccessLogRepositoryTypeorm],
  exports: [AccessLogService],
})
export class AccessLogModule {}
