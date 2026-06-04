import { TokenBlacklistService } from '../../src/infrastructure/auth/token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  beforeEach(() => {
    service = new TokenBlacklistService();
    service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('revoke / isRevoked', () => {
    it('deve retornar false para token que não foi revogado', () => {
      expect(service.isRevoked('token-inexistente')).toBe(false);
    });

    it('deve retornar true para token revogado com expiração futura', () => {
      const futureExp = Date.now() + 60_000;
      service.revoke('token-abc', futureExp);

      expect(service.isRevoked('token-abc')).toBe(true);
    });

    it('deve retornar false para token revogado cuja expiração já passou (lazy cleanup)', () => {
      const pastExp = Date.now() - 60_000;
      service.revoke('token-expirado', pastExp);

      expect(service.isRevoked('token-expirado')).toBe(false);
      // Lazy cleanup: a próxima consulta não precisa mais consultar a entrada.
      expect(service.isRevoked('token-expirado')).toBe(false);
    });

    it('deve suportar múltiplos tokens revogados independentemente', () => {
      const futureExp = Date.now() + 60_000;
      service.revoke('token-a', futureExp);
      service.revoke('token-b', futureExp);

      expect(service.isRevoked('token-a')).toBe(true);
      expect(service.isRevoked('token-b')).toBe(true);
      expect(service.isRevoked('token-c')).toBe(false);
    });
  });

  describe('ciclo de vida do módulo', () => {
    it('onModuleInit deve iniciar o timer de cleanup (unref para não bloquear shutdown)', () => {
      // Já chamado no beforeEach. Verifica que isRevoked funciona após init.
      service.revoke('token-after-init', Date.now() + 60_000);
      expect(service.isRevoked('token-after-init')).toBe(true);
    });

    it('onModuleDestroy deve limpar o timer sem erros', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });

    it('onModuleDestroy deve ser idempotente', () => {
      service.onModuleDestroy();
      expect(() => service.onModuleDestroy()).not.toThrow();
    });

    it('onModuleDestroy deve ser no-op se timer nunca foi iniciado', () => {
      const fresh = new TokenBlacklistService();
      // Não chama onModuleInit — cleanupTimer é null
      expect(() => fresh.onModuleDestroy()).not.toThrow();
    });
  });

  describe('purgeExpired (timer de cleanup)', () => {
    let isolatedService: TokenBlacklistService;
    // Ponto fixo no tempo: tudo que é "futuro" é > baseTime, tudo que é
    // "passado" é < baseTime. Permite usar jest.useFakeTimers sem
    // Date.now() começar em 0 e invalidar todas as referências relativas.
    const BASE_TIME = 1_700_000_000_000;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(BASE_TIME);
      isolatedService = new TokenBlacklistService();
    });

    afterEach(() => {
      isolatedService.onModuleDestroy();
      jest.useRealTimers();
    });

    it('deve remover tokens expirados quando o timer dispara (cobre purgeExpired)', () => {
      isolatedService.onModuleInit();
      // Adiciona tokens: dois expirados, dois válidos (longe no futuro)
      isolatedService.revoke('expirado-1', BASE_TIME - 60_000);
      isolatedService.revoke('expirado-2', BASE_TIME - 1_000);
      isolatedService.revoke('valido-1', BASE_TIME + 3_600_000);
      isolatedService.revoke('valido-2', BASE_TIME + 7_200_000);

      // Avança o tempo o suficiente para o interval disparar (5 min)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1);

      // Expirados devem ter sido removidos
      expect(isolatedService.isRevoked('expirado-1')).toBe(false);
      expect(isolatedService.isRevoked('expirado-2')).toBe(false);
      // Válidos continuam
      expect(isolatedService.isRevoked('valido-1')).toBe(true);
      expect(isolatedService.isRevoked('valido-2')).toBe(true);
    });

    it('não deve chamar logger.debug se nada foi removido', () => {
      const debugSpy = jest.spyOn((isolatedService as any).logger, 'debug');
      isolatedService.onModuleInit();
      // Token ainda válido daqui 1h
      isolatedService.revoke('valido', BASE_TIME + 3_600_000);

      jest.advanceTimersByTime(5 * 60 * 1000 + 1);

      // Como nada foi removido, debug não deve ter sido chamado
      expect(debugSpy).not.toHaveBeenCalled();
      debugSpy.mockRestore();
    });

    it('deve chamar logger.debug quando remove entradas expiradas', () => {
      const debugSpy = jest.spyOn((isolatedService as any).logger, 'debug');
      isolatedService.onModuleInit();
      isolatedService.revoke('expirado-a', BASE_TIME - 1_000);
      isolatedService.revoke('expirado-b', BASE_TIME - 2_000);

      jest.advanceTimersByTime(5 * 60 * 1000 + 1);

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Blacklist cleanup: removed 2 expired entries'),
      );
      debugSpy.mockRestore();
    });
  });
});
