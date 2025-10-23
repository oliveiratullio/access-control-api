import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessLogEntity } from '../../entities/AcessLog.entity';


@Injectable()
export class AccessLogRepositoryTypeorm {
  constructor(
    @InjectRepository(AccessLogEntity)
    private readonly repo: Repository<AccessLogEntity>,
  ) {}

  async record(userId: string, email: string, ip: string) {
    const log = this.repo.create({ userId, email, ip });
    return this.repo.save(log);
  }
}
