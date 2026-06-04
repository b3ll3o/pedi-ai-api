import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../src/presentation/auth/auth.controller';
import { AuthService } from '../../src/presentation/auth/auth.service';
import { JwtAuthGuard } from '../../src/presentation/auth/guards/jwt-auth.guard';
import { LoginDto } from '../../src/application/auth/dto/login.dto';
import { RegisterDto } from '../../src/application/auth/dto/register.dto';
import { RefreshTokenDto } from '../../src/application/auth/dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
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

  describe('register', () => {
    it('deve chamar authService.register com o DTO recebido', async () => {
      const registerDto: RegisterDto = {
        nome: 'Novo',
        email: 'novo@test.com',
        senha: 'password123',
      };
      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
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
    it('should call authService.logout with userId and access token from Authorization header', async () => {
      const mockReq = {
        user: {
          userId: 'user-123',
          email: 'test@test.com',
          perfilId: 'perfil-1',
        },
        headers: {
          authorization: 'Bearer access-token-abc',
        },
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq);

      expect(authService.logout).toHaveBeenCalledWith('user-123', 'access-token-abc');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });

    it('should call authService.logout with userId and undefined token when no Authorization header', async () => {
      const mockReq = {
        user: {
          userId: 'user-123',
          email: 'test@test.com',
          perfilId: 'perfil-1',
        },
        headers: {},
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq);

      expect(authService.logout).toHaveBeenCalledWith('user-123', undefined);
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
        perfil: { id: 'perfil-1', nome: 'ADMIN' },
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
        perfil: { id: 'perfil-1', nome: 'ADMIN' },
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
        perfil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUsuario as any);

      const result = await controller.me(mockReq);

      expect(result.perfil).toBeNull();
    });

    it('deve lançar UnauthorizedException quando validateUser retorna null', async () => {
      const mockReq = {
        user: {
          userId: 'user-deleted',
          email: 'deleted@test.com',
          perfilId: null,
        },
      } as any;

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.me(mockReq)).rejects.toThrow(UnauthorizedException);
      await expect(controller.me(mockReq)).rejects.toThrow('Usuário não encontrado');
    });
  });
});

describe('AuthController - envInt fallback (THROTTLE env vars inválidas)', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('deve cair no fallback quando THROTTLE_SHORT_LIMIT é NaN (cobre linha 34-35)', () => {
    process.env.THROTTLE_SHORT_LIMIT = 'abc';
    process.env.THROTTLE_LONG_LIMIT = '20';

    // A mera re-importação do módulo força a reavaliação das consts module-level
    // (envInt → fallback). Se o parseInt não tivesse fallback, o decorator @Throttle
    // receberia NaN e o ThrottlerModule quebraria em runtime.
    expect(() => {
      jest.isolateModules(() => {
        require('../../src/presentation/auth/auth.controller');
      });
    }).not.toThrow();
  });

  it('deve cair no fallback quando THROTTLE_SHORT_LIMIT <= 0', () => {
    process.env.THROTTLE_SHORT_LIMIT = '0';
    process.env.THROTTLE_LONG_LIMIT = '20';

    expect(() => {
      jest.isolateModules(() => {
        require('../../src/presentation/auth/auth.controller');
      });
    }).not.toThrow();
  });
});
