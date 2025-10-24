import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/infra/database/entities/User.entity';
import { AccessLogEntity } from '../src/infra/database/entities/AcessLog.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

// Tipos auxiliares para respostas
type AccessLogResponse = AccessLogEntity;

describe('Access Logs E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let admin: UserEntity;
  let user: UserEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    
    await dataSource.getRepository(AccessLogEntity).createQueryBuilder().delete().execute();
    await dataSource.getRepository(UserEntity).createQueryBuilder().delete().execute();

    
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    const adminEmail = faker.internet.email();
    admin = dataSource.getRepository(UserEntity).create({
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminHashedPassword,
      role: 'admin',
    });
    await dataSource.getRepository(UserEntity).save(admin);

    
    const userHashedPassword = await bcrypt.hash('user123', 10);
    const userEmail = faker.internet.email();
    user = dataSource.getRepository(UserEntity).create({
      name: 'Regular User',
      email: userEmail,
      passwordHash: userHashedPassword,
      role: 'user',
    });
    await dataSource.getRepository(UserEntity).save(user);

    
    adminToken = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    
    const logs = [
      {
        userId: admin.id,
        email: admin.email,
        ip: '192.168.1.1',
        createdAt: new Date('2023-01-01T10:00:00Z'),
      },
      {
        userId: user.id,
        email: user.email,
        ip: '192.168.1.2',
        createdAt: new Date('2023-01-02T10:00:00Z'),
      },
      {
        userId: admin.id,
        email: admin.email,
        ip: '192.168.1.3',
        createdAt: new Date('2023-01-03T10:00:00Z'),
      },
    ];

    for (const log of logs) {
      const accessLog = dataSource.getRepository(AccessLogEntity).create(log);
      await dataSource.getRepository(AccessLogEntity).save(accessLog);
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/access-logs (GET)', () => {
    it('should return access logs for admin', () => {
      return request(app.getHttpServer())
        .get('/access-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(3);
          const dates = (res.body as AccessLogResponse[]).map((log) => new Date(log.createdAt));
          expect(dates[0].getTime()).toBeGreaterThanOrEqual(dates[1].getTime());
          expect(dates[1].getTime()).toBeGreaterThanOrEqual(dates[2].getTime());

          (res.body as AccessLogResponse[]).forEach((log) => {
            expect(log).toHaveProperty('id');
            expect(log).toHaveProperty('userId');
            expect(log).toHaveProperty('email');
            expect(log).toHaveProperty('ip');
            expect(log).toHaveProperty('createdAt');
          });
        });
    });

    it('should reject request from non-admin user', () => {
      return request(app.getHttpServer())
        .get('/access-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/access-logs')
        .expect(401);
    });

    it('should limit results to 100 logs', async () => {
      const logs = Array.from({ length: 150 }, (_, i) => ({
        userId: admin.id,
        email: admin.email,
        ip: `192.168.1.${i}`,
        createdAt: new Date(),
      }));

      for (const log of logs) {
        const accessLog = dataSource.getRepository(AccessLogEntity).create(log);
        await dataSource.getRepository(AccessLogEntity).save(accessLog);
      }

      return request(app.getHttpServer())
        .get('/access-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeLessThanOrEqual(100);
        });
    });

    it('should return empty array when no logs exist', async () => {
      await dataSource.getRepository(AccessLogEntity).createQueryBuilder().delete().execute();

      return request(app.getHttpServer())
        .get('/access-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });
});
