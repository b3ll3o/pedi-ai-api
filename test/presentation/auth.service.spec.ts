import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/presentation/auth/auth.service';
import { IUsuariosRepository } from '../../src/domain/interfaces/usuarios-repository.interface';
import { IRefreshTokenRepository } from '../../src/domain/interfaces/refresh-token-repository.interface';
import { ISenhaHashService } from '../../src/domain/services/senha-hash.service';
import { LoginDto } from '../../src/application/auth/dto/login.dto';
import { RefreshTokenDto } from '../../src/application/auth/dto/refresh-token.dto';

const mockUsuario = {
  id: 'uuid-test',
  nome: 'Usuario Teste',
  email: 'teste@exemplo.com',
  senha: 'senha-hashed',
  perfilId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  version: 1,
};

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuariosRepository: jest.Mocked<IUsuariosRepository>;
  let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let mockSenhaHashService: jest.Mocked<ISenhaHashService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUsuariosRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockRefreshTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByToken: jest.fn(),
    };

    mockSenhaHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    authService = new AuthService(
      mockUsuariosRepository,
      mockRefreshTokenRepository,
      mockSenhaHashService,
      mockJwtService,
    );
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'teste@exemplo.com',
      senha: 'senha123',
    };

    it('deve retornar tokens quando credenciais forem válidas', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockSenhaHashService.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('tokenType', 'Bearer');
      expect(mockUsuariosRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockSenhaHashService.compare).toHaveBeenCalledWith(loginDto.senha, mockUsuario.senha);
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar UnauthorizedException quando senha for inválida', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockSenhaHashService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar UnauthorizedException quando usuário não tiver senha', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue({ ...mockUsuario, senha: '' });

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('deve retornar novo access token quando refresh token for válido', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: 'rt-id',
        token: refreshTokenDto.refreshToken,
        userId: mockUsuario.id,
        expiresAt,
        createdAt: new Date(),
      } as any);
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue();
      mockUsuariosRepository.findById.mockResolvedValue(mockUsuario);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await authService.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('deve lançar UnauthorizedException quando refresh token não existir', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando refresh token estiver expirado', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: 'rt-id',
        token: refreshTokenDto.refreshToken,
        userId: mockUsuario.id,
        expiresAt: expiredDate,
        createdAt: new Date(),
      } as any);
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue();

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando usuário do refresh token não existir', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: 'rt-id',
        token: refreshTokenDto.refreshToken,
        userId: 'non-existent-user',
        expiresAt,
        createdAt: new Date(),
      } as any);
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue();
      mockUsuariosRepository.findById.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deve deletar todos refresh tokens do usuário', async () => {
      mockRefreshTokenRepository.deleteByUserId.mockResolvedValue();

      await authService.logout(mockUsuario.id);

      expect(mockRefreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(mockUsuario.id);
    });
  });

  describe('validateUser', () => {
    it('deve retornar usuário quando encontrado', async () => {
      mockUsuariosRepository.findById.mockResolvedValue(mockUsuario);

      const result = await authService.validateUser(mockUsuario.id);

      expect(result).toEqual(mockUsuario);
      expect(mockUsuariosRepository.findById).toHaveBeenCalledWith(mockUsuario.id);
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      mockUsuariosRepository.findById.mockResolvedValue(null);

      const result = await authService.validateUser('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
