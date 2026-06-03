import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/presentation/auth/auth.service';
import { IUsuariosRepository } from '../../src/domain/interfaces/usuarios-repository.interface';
import { IRefreshTokenRepository } from '../../src/domain/interfaces/refresh-token-repository.interface';
import { IPerfisRepository } from '../../src/domain/interfaces/perfis-repository.interface';
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
  let mockPerfisRepository: jest.Mocked<IPerfisRepository>;
  let mockSenhaHashService: jest.Mocked<ISenhaHashService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUsuariosRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailIncludingDeleted: jest.fn(),
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
      rotate: jest.fn(),
    };

    mockPerfisRepository = {
      findById: jest.fn(),
      findByNome: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      associarPermissoes: jest.fn(),
      desassociarPermissao: jest.fn(),
      findPermissoesByIds: jest.fn(),
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
      mockPerfisRepository,
      mockSenhaHashService,
      { revoke: jest.fn(), isRevoked: jest.fn() } as any,
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

    it('deve incluir jti único em cada refresh token para evitar P2002 em logins rápidos', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockSenhaHashService.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token-1')
        .mockResolvedValueOnce('refresh-token-1')
        .mockResolvedValueOnce('access-token-2')
        .mockResolvedValueOnce('refresh-token-2');
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      await authService.login(loginDto);
      await authService.login(loginDto);

      const signAsyncCalls = mockJwtService.signAsync.mock.calls;
      const refreshPayloads = [signAsyncCalls[1][0], signAsyncCalls[3][0]] as Array<
        Record<string, unknown>
      >;
      expect(refreshPayloads[0]).toHaveProperty('jti');
      expect(refreshPayloads[1]).toHaveProperty('jti');
      expect(refreshPayloads[0].jti).not.toEqual(refreshPayloads[1].jti);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('deve rotacionar tokens (novo access + novo refresh) quando refresh token for válido', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: 'rt-id',
        token: refreshTokenDto.refreshToken,
        userId: mockUsuario.id,
        expiresAt,
        createdAt: new Date(),
      } as any);
      mockRefreshTokenRepository.rotate.mockResolvedValue({} as any);
      mockUsuariosRepository.findById.mockResolvedValue(mockUsuario);
      // refresh é assinado antes de access em generateRefreshTokenTransactional
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-refresh-token')
        .mockResolvedValueOnce('new-access-token');

      const result = await authService.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result).toHaveProperty('tokenType', 'Bearer');
      expect(mockRefreshTokenRepository.rotate).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        'new-refresh-token',
        mockUsuario.id,
        expect.any(Date),
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

    it('deve revogar o access token se fornecido', async () => {
      mockRefreshTokenRepository.deleteByUserId.mockResolvedValue();
      const futureExp = Math.floor(Date.now() / 1000) + 900;
      mockJwtService.decode.mockReturnValue({ exp: futureExp });

      await authService.logout(mockUsuario.id, 'access-token-abc');

      expect(mockJwtService.decode).toHaveBeenCalledWith('access-token-abc');
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
