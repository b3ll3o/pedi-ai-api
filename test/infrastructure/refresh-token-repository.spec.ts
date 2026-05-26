import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { RefreshTokenRepositoryImpl } from '../../src/infrastructure/database/prisma/repositories/refresh-token-repository.impl';

const mockPrisma = {
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('RefreshTokenRepositoryImpl', () => {
  let repository: RefreshTokenRepositoryImpl;

  const mockRefreshToken = {
    id: 'rt-uuid-test',
    token: 'refresh-token-value',
    userId: 'user-uuid-test',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        RefreshTokenRepositoryImpl,
      ],
    }).compile();

    repository = module.get<RefreshTokenRepositoryImpl>(RefreshTokenRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um refresh token com dados válidos', async () => {
      mockPrisma.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const resultado = await repository.create('refresh-token-value', 'user-uuid-test', expiresAt);

      expect(resultado).toEqual(mockRefreshToken);
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: 'refresh-token-value',
          userId: 'user-uuid-test',
          expiresAt,
        },
      });
    });
  });

  describe('findByToken', () => {
    it('deve retornar refresh token quando encontrado', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const resultado = await repository.findByToken('refresh-token-value');

      expect(resultado).toEqual(mockRefreshToken);
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token-value' },
        include: { user: true },
      });
    });

    it('deve retornar null quando refresh token não encontrado', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      const resultado = await repository.findByToken('token-invalido');

      expect(resultado).toBeNull();
    });
  });

  describe('deleteByUserId', () => {
    it('deve deletar todos refresh tokens do usuário', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deleteByUserId('user-uuid-test');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-test' },
      });
    });
  });

  describe('deleteByToken', () => {
    it('deve deletar refresh token específico', async () => {
      mockPrisma.refreshToken.delete.mockResolvedValue(mockRefreshToken);

      await repository.deleteByToken('refresh-token-value');

      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'refresh-token-value' },
      });
    });
  });
});
