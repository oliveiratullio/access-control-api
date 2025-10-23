import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/application/access-log/auth/auth.service';
import { LocalAuthGuard } from 'src/application/access-log/auth/guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessLogService } from 'src/application/access-log/access-log.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let accessLogService: AccessLogService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  const mockAccessLogService = {
    record: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AccessLogService,
          useValue: mockAccessLogService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    accessLogService = module.get<AccessLogService>(AccessLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const mockToken = 'mock-jwt-token';

      mockAuthService.login.mockResolvedValue({
        access_token: mockToken,
        user: mockUser,
      });

      const mockReq = {
        user: mockUser,
        headers: {},
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
      };

      const result = await controller.login(mockReq);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role
        }
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(accessLogService.record).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        '127.0.0.1'
      );
    });

    it('should handle x-forwarded-for header', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const mockToken = 'mock-jwt-token';

      mockAuthService.login.mockResolvedValue({
        access_token: mockToken,
        user: mockUser,
      });

      const mockReq = {
        user: mockUser,
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
      };

      await controller.login(mockReq);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(accessLogService.record).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        '192.168.1.1'
      );
    });

    it('should handle unknown IP when no headers available', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const mockToken = 'mock-jwt-token';

      mockAuthService.login.mockResolvedValue({
        access_token: mockToken,
        user: mockUser,
      });

      const mockReq = {
        user: mockUser,
        headers: {},
        ip: undefined,
        connection: { remoteAddress: undefined },
      };

      await controller.login(mockReq);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(accessLogService.record).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        'unknown'
      );
    });
  });
});
