import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from '../../src/presentation/auth/strategies/jwt.strategy';
import { AuthService } from '../../src/presentation/auth/auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user payload when user exists', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        email: 'test@test.com',
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

      const result = await strategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@test.com',
        perfilId: 'perfil-1',
      });
    });

    it('should return user payload with null perfilId when user has no perfil', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        email: 'test@test.com',
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

      const result = await strategy.validate(payload);

      expect(result.perfilId).toBeNull();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        email: 'test@test.com',
        perfilId: null,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});