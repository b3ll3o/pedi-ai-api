import { TokenBlacklistService } from '../../src/infrastructure/auth/token-blacklist.service';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

describe('TokenBlacklistService', () => {
  // Mock mínimo do PrismaService — espelha apenas a interface que o service usa.
  // O service chama `revokedJti.{upsert,findUnique,deleteMany}`, então o mock
  // precisa desses 3 métodos. Cada teste configura o retorno conforme o caso.
  let mockPrisma: jest.Mocked<Pick<PrismaService, 'revokedJti'>> & {
    revokedJti: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let service: TokenBlacklistService;

  beforeEach(() => {
    mockPrisma = {
      revokedJti: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    } as any;
    service = new TokenBlacklistService(mockPrisma as unknown as PrismaService);
    service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('revoke / isRevoked', () => {
    it('deve retornar false para jti que não foi revogado', async () => {
      mockPrisma.revokedJti.findUnique.mockResolvedValue(null);
      await expect(service.isRevoked('jti-inexistente')).resolves.toBe(false);
    });

    it('deve retornar true para jti revogado com expiração futura', async () => {
      const futureExp = new Date(Date.now() + 60_000);
      mockPrisma.revokedJti.upsert.mockResolvedValue({} as any);
      mockPrisma.revokedJti.findUnique.mockResolvedValue({ expiresAt: futureExp } as any);

      await service.revoke('jti-abc', Math.floor(futureExp.getTime() / 1000));

      await expect(service.isRevoked('jti-abc')).resolves.toBe(true);
    });

    it('deve retornar false para jti revogado cuja expiração já passou (sem consultar DB novamente)', async () => {
      const pastExp = new Date(Date.now() - 60_000);
      mockPrisma.revokedJti.findUnique.mockResolvedValue({ expiresAt: pastExp } as any);

      await expect(service.isRevoked('jti-expirado')).resolves.toBe(false);
    });

    it('deve usar upsert em revoke (idempotente)', async () => {
      mockPrisma.revokedJti.upsert.mockResolvedValue({} as any);
      const exp = Math.floor(Date.now() / 1000) + 60;

      await service.revoke('jti-x', exp, 'user-1');
      await service.revoke('jti-x', exp, 'user-1');

      expect(mockPrisma.revokedJti.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.revokedJti.upsert).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { jti: 'jti-x' },
          create: expect.objectContaining({ jti: 'jti-x', userId: 'user-1' }),
        }),
      );
    });

    it('deve suportar múltiplos jtis revogados independentemente', async () => {
      const futureExp = new Date(Date.now() + 60_000);
      mockPrisma.revokedJti.upsert.mockResolvedValue({} as any);
      // jti-a e jti-b revogados; jti-c não
      mockPrisma.revokedJti.findUnique.mockImplementation(async ({ where }) => {
        if (where.jti === 'jti-a' || where.jti === 'jti-b') {
          return { expiresAt: futureExp } as any;
        }
        return null;
      });

      await service.revoke('jti-a', Math.floor(futureExp.getTime() / 1000));
      await service.revoke('jti-b', Math.floor(futureExp.getTime() / 1000));

      await expect(service.isRevoked('jti-a')).resolves.toBe(true);
      await expect(service.isRevoked('jti-b')).resolves.toBe(true);
      await expect(service.isRevoked('jti-c')).resolves.toBe(false);
    });
  });

  describe('ciclo de vida do módulo', () => {
    it('onModuleDestroy deve limpar o timer sem erros', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });

    it('onModuleDestroy deve ser idempotente', () => {
      service.onModuleDestroy();
      expect(() => service.onModuleDestroy()).not.toThrow();
    });

    it('onModuleDestroy deve ser no-op se timer nunca foi iniciado', () => {
      const fresh = new TokenBlacklistService(mockPrisma as unknown as PrismaService);
      // Não chama onModuleInit — cleanupTimer é null
      expect(() => fresh.onModuleDestroy()).not.toThrow();
    });
  });

  describe('purgeExpired (timer de cleanup)', () => {
    let isolatedService: TokenBlacklistService;
    const BASE_TIME = 1_700_000_000_000;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(BASE_TIME);
      isolatedService = new TokenBlacklistService(mockPrisma as unknown as PrismaService);
    });

    afterEach(() => {
      isolatedService.onModuleDestroy();
      jest.useRealTimers();
    });

    it('deve chamar deleteMany para remover expirados quando o timer dispara', async () => {
      mockPrisma.revokedJti.deleteMany.mockResolvedValue({ count: 2 });
      isolatedService.onModuleInit();

      // Avança o tempo o suficiente para o interval disparar (5 min)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1);
      // Como deleteMany agora é async, o callback resolve no próximo microtask
      await Promise.resolve();

      expect(mockPrisma.revokedJti.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });

    it('deve logar debug quando remove entradas expiradas', async () => {
      const debugSpy = jest.spyOn((isolatedService as any).logger, 'debug');
      mockPrisma.revokedJti.deleteMany.mockResolvedValue({ count: 2 });
      isolatedService.onModuleInit();

      jest.advanceTimersByTime(5 * 60 * 1000 + 1);
      await Promise.resolve();

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Blacklist cleanup: removed 2 expired entries'),
      );
      debugSpy.mockRestore();
    });

    it('deve logar error se cleanup falhar (mas não derrubar o serviço)', async () => {
      const errorSpy = jest.spyOn((isolatedService as any).logger, 'error');
      mockPrisma.revokedJti.deleteMany.mockRejectedValue(new Error('DB indisponível'));
      isolatedService.onModuleInit();

      jest.advanceTimersByTime(5 * 60 * 1000 + 1);
      await Promise.resolve();
      await Promise.resolve();

      expect(errorSpy).toHaveBeenCalledWith('Cleanup failed', expect.any(Error));
      errorSpy.mockRestore();
    });
  });
});
