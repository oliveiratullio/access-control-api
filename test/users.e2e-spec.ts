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


type SafeUser = Omit<UserEntity, 'passwordHash'>;

describe('Users E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let UserEmail: string;

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
    const admin = dataSource.getRepository(UserEntity).create({
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminHashedPassword,
      role: 'admin',
    });
    await dataSource.getRepository(UserEntity).save(admin);

    const userHashedPassword = await bcrypt.hash('user123', 10);
    const userEmail = faker.internet.email();
    const user = dataSource.getRepository(UserEntity).create({
      name: 'Regular User',
      email: userEmail,
      passwordHash: userHashedPassword,
      role: 'user',
    });
    await dataSource.getRepository(UserEntity).save(user);

    adminToken = jwt.sign(
      { sub: admin.id, email: adminEmail, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { sub: user.id, email: userEmail, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    UserEmail = userEmail;

  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/users/me (GET)', () => {
    
    it('should return current user info', () => {
      
      const userEmail = faker.internet.email()
      
      console.log('userEmail', userEmail)

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(UserEmail);
          console.log(userEmail)
          expect(res.body.name).toBe('Regular User');
          expect(res.body.role).toBe('user');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users for admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          (res.body as SafeUser[]).forEach((user) => {
            expect(user).not.toHaveProperty('passwordHash');
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('role');
          });
        });
    });

    it('should reject request from non-admin user', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('/users (POST)', () => {
    it('should create new user for admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'newpassword123',
          role: 'user',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('New User');
          expect(res.body.email).toBe('newuser@example.com');
          expect(res.body.role).toBe('user');
          expect(res.body).not.toHaveProperty('passwordHash');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should create user with default role when not specified', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Default User',
          email: 'default@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.role).toBe('user');
        });
    });

    it('should reject request from non-admin user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'newpassword123',
        })
        .expect(403);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const duplicateTestEmail = "test@example.com";
      
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'First User',
          email: duplicateTestEmail,
          password: 'password123',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Second User',
          email: duplicateTestEmail,
          password: 'password123',
        })
        .expect(500);
    });
  });
});
