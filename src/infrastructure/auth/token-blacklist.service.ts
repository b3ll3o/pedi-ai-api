import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

/**
 * Blacklist em memória para tokens JWT invalidados por logout.
 *
 * Limitação conhecida: é por-instância. Em deploy multi-instância, usar Redis
 * ou store compartilhado. Para o MVP (1 instância) é suficiente.
 *
 * Cleanup: a cada `CLEANUP_INTERVAL_MS` varre o map e remove tokens cuja
 * `expiresAt` já passou. Sem isso, tokens revogados cuja `exp` já expirou
 * continuam ocupando memória se nunca forem checados de novo (cenário comum:
 * logout em um client, mas outros clients nunca usam esse token específico).
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklist = new Map<string, number>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  private static readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

  onModuleInit(): void {
    this.cleanupTimer = setInterval(
      () => this.purgeExpired(),
      TokenBlacklistService.CLEANUP_INTERVAL_MS,
    );
    // `unref` permite que o processo termine mesmo com o timer ativo (importante
    // em testes onde o Jest mata o módulo abruptamente).
    this.cleanupTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  revoke(token: string, expiresAt: number): void {
    this.blacklist.set(token, expiresAt);
  }

  isRevoked(token: string): boolean {
    const expiresAt = this.blacklist.get(token);
    if (!expiresAt) return false;
    if (Date.now() >= expiresAt) {
      this.blacklist.delete(token);
      return false;
    }
    return true;
  }

  private purgeExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [token, expiresAt] of this.blacklist) {
      if (now >= expiresAt) {
        this.blacklist.delete(token);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.debug(`Blacklist cleanup: removed ${removed} expired entries`);
    }
  }
}
