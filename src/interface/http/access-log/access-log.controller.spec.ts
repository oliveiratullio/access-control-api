import { Test, TestingModule } from '@nestjs/testing';
import { AccessLogController } from './access-log.controller';
import { AccessLogService } from 'src/application/access-log/access-log.service';
import { JwtAuthGuard } from 'src/application/access-log/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessLogEntity } from 'src/infra/database/entities/AcessLog.entity';
import { Repository } from 'typeorm';

describe('AccessLogController', () => {
  let controller: AccessLogController;
  let accessLogService: AccessLogService;
  let repository: Repository<AccessLogEntity>;

  const mockRepository = {
    find: jest.fn(),
  };

  const mockAccessLogService = {
    // Add any service methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessLogController],
      providers: [
        {
          provide: AccessLogService,
          useValue: mockAccessLogService,
        },
        {
          provide: getRepositoryToken(AccessLogEntity),
          useValue: mockRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccessLogController>(AccessLogController);
    accessLogService = module.get<AccessLogService>(AccessLogService);
    repository = module.get<Repository<AccessLogEntity>>(getRepositoryToken(AccessLogEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return access logs ordered by creation date descending', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'user-1',
          email: 'user1@example.com',
          ip: '192.168.1.1',
          createdAt: new Date('2023-01-02T10:00:00Z'),
        },
        {
          id: 'log-2',
          userId: 'user-2',
          email: 'user2@example.com',
          ip: '192.168.1.2',
          createdAt: new Date('2023-01-01T10:00:00Z'),
        },
      ];

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await controller.list();

      expect(result).toEqual(mockLogs);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });

    it('should return empty array when no logs found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });

    it('should limit results to 100 logs', async () => {
      const mockLogs = Array.from({ length: 50 }, (_, i) => ({
        id: `log-${i}`,
        userId: `user-${i}`,
        email: `user${i}@example.com`,
        ip: `192.168.1.${i}`,
        createdAt: new Date(),
      }));

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await controller.list();

      expect(result).toEqual(mockLogs);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });
  });
});
