import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from '../../src/presentation/auth/strategies/jwt.strategy';
import { AuthService } from '../../src/presentation/auth/auth.service';
import { TokenBlacklistService } from '../../src/infrastructure/auth/token-blacklist.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;
  let tokenBlacklist: jest.Mocked<TokenBlacklistService>;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockTokenBlacklist = {
    revoke: jest.fn(),
    isRevoked: jest.fn(),
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklist,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockReq = { headers: { authorization: 'Bearer test-token' } } as any;

    it('should return user payload when user exists', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        perfilId: 'perfil-1',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      const mockUsuario = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@test.com',
        perfilId: 'perfil-1',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUsuario as any);

      const result = await strategy.validate(mockReq, payload);

      expect(authService.validateUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        userId: 'user-123',
        perfilId: 'perfil-1',
      });
    });

    it('should return user payload with null perfilId when user has no perfil', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        perfilId: null,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      const mockUsuario = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@test.com',
        perfilId: null,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUsuario as any);

      const result = await strategy.validate(mockReq, payload);

      expect(result.perfilId).toBeNull();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        perfilId: null,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(mockReq, payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
