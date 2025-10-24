import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/infra/database/entities/User.entity';
import { AccessLogEntity } from '../src/infra/database/entities/AcessLog.entity';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

describe('Auth E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let TestEmail: string;
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

    const hashedPassword = await bcrypt.hash('password123', 10);
    const testEmail = faker.internet.email();
    TestEmail = testEmail;

    const user = dataSource.getRepository(UserEntity).create({
      name: 'Test User',
      email: testEmail,
      passwordHash: hashedPassword,
      role: 'user',
    });
    await dataSource.getRepository(UserEntity).save(user);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TestEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(TestEmail);
          expect(res.body.user).not.toHaveProperty('passwordHash');
        });
    });
    it('should reject invalid credentials', () => {
      const testEmail = faker.internet.email()
      return request(app.getHttpServer())
        .post('/auth/login')

        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      const testEmail = faker.internet.email()
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
        })
        .expect(401);
    });
  });
});
