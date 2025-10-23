import { Injectable } from '@nestjs/common';
import { AccessLogRepositoryTypeorm } from 'src/infra/database/database/repositories/access-log.repository';


@Injectable()
export class AccessLogService {
  constructor(private readonly logsRepo: AccessLogRepositoryTypeorm) {}

  async record(userId: string, email: string, ip: string) {
    await this.logsRepo.record(userId, email, ip);
  }
}
