import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/presentation/auth/auth.controller';
import { AuthService } from '../../src/presentation/auth/auth.service';
import { JwtAuthGuard } from '../../src/presentation/auth/guards/jwt-auth.guard';
import { LoginDto } from '../../src/application/auth/dto/login.dto';
import { RefreshTokenDto } from '../../src/application/auth/dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct DTO', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', senha: 'password123' };
      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken with correct DTO', async () => {
      const refreshDto: RefreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const expectedResult = {
        accessToken: 'new-access-token',
        expiresIn: 900,
      };
      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId', async () => {
      const mockReq = {
        user: {
          userId: 'user-123',
          email: 'test@test.com',
          perfilId: 'perfil-1',
        },
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq);

      expect(authService.logout).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });

  describe('me', () => {
    it('should return user data when user exists', async () => {
      const mockReq = {
        user: {
          userId: 'user-123',
          email: 'test@test.com',
          perfilId: 'perfil-1',
        },
      } as any;

      const mockUsuario = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@test.com',
        perfilId: 'perfil-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUsuario as any);

      const result = await controller.me(mockReq);

      expect(authService.validateUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: 'user-123',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: 'perfil-1' },
        createdAt: mockUsuario.createdAt,
        updatedAt: mockUsuario.updatedAt,
      });
    });

    it('should return null perfil when user has no perfilId', async () => {
      const mockReq = {
        user: {
          userId: 'user-123',
          email: 'test@test.com',
          perfilId: null,
        },
      } as any;

      const mockUsuario = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@test.com',
        perfilId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUsuario as any);

      const result = await controller.me(mockReq);

      expect(result.perfil).toBeNull();
    });
  });
});
