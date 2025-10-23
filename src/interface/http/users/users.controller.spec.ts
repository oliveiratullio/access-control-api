import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from 'src/application/access-log/users/users.service';
import { JwtAuthGuard } from 'src/application/access-log/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from '../auth/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    findAll: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user without password hash', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        passwordHash: 'hashed-password',
      };

      const mockReq = {
        user: { userId: 'user-id' },
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockReq);

      expect(result).toEqual({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should return null when user not found', async () => {
      const mockReq = {
        user: { userId: 'non-existent-id' },
      };

      mockUsersService.findById.mockResolvedValue(null);

      const result = await controller.getMe(mockReq);

      expect(result).toBeNull();
      expect(usersService.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('list', () => {
    it('should return all users without password hashes', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'user',
          passwordHash: 'hash1',
        },
        {
          id: 'user-2',
          name: 'User 2',
          email: 'user2@example.com',
          role: 'admin',
          passwordHash: 'hash2',
        },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.list();

      expect(result).toEqual([
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'user',
        },
        {
          id: 'user-2',
          name: 'User 2',
          email: 'user2@example.com',
          role: 'admin',
        },
      ]);
      expect(result.every(user => !user.hasOwnProperty('passwordHash'))).toBe(true);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create user with provided role', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'admin',
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'admin',
        passwordHash: 'hashed-password',
      };

      mockUsersService.createUser.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'admin',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(usersService.createUser).toHaveBeenCalledWith(
        'New User',
        'newuser@example.com',
        'password123',
        'admin'
      );
    });

    it('should create user with default role when not provided', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
        passwordHash: 'hashed-password',
      };

      mockUsersService.createUser.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
      });
      expect(usersService.createUser).toHaveBeenCalledWith(
        'New User',
        'newuser@example.com',
        'password123',
        'user'
      );
    });
  });
});
