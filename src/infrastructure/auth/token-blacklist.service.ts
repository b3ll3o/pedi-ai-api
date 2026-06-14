import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Blacklist de JWTs (jti) revogados por logout, persistida no Postgres.
 *
 * Antes: blacklist em memória (Map) na `TokenBlacklistService`. Em deploy
 * multi-instância, revogar em uma instância não era visível nas outras —
 * o token permanecia válido até expirar.
 *
 * Agora: cada revogação grava na tabela `revoked_jtis`. O `JwtAuthGuard`
 * (e quem mais precisar) consulta `isRevoked(jti)` antes de aceitar o token.
 * Persistir no Postgres garante consistência entre instâncias e
 * sobrevive a restarts.
 *
 * Cleanup: a cada `CLEANUP_INTERVAL_MS`, varre `expiresAt < now` e remove
 * as linhas. Sem isso a tabela cresce indefinidamente. O índice em
 * `expiresAt` torna a varredura barata.
 *
 * Edge case: se o banco cair temporariamente, `revoke` propaga o erro
 * (fail-closed — não aceitamos um logout que não foi persistido).
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.cleanupTimer = setInterval(
      () => this.purgeExpired().catch((err) => this.logger.error('Cleanup failed', err)),
      CLEANUP_INTERVAL_MS,
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

  /**
   * Revoga um token (identificado pelo `jti` do JWT) até sua expiração natural.
   * Idempotente: chamar duas vezes com o mesmo jti é seguro (PK = jti).
   */
  async revoke(jti: string, expiresAt: number, userId?: string): Promise<void> {
    await this.prisma.revokedJti.upsert({
      where: { jti },
      create: {
        jti,
        userId,
        expiresAt: new Date(expiresAt * 1000),
      },
      update: {}, // já revogado — nada a fazer
    });
  }

  /**
   * Verifica se um jti está revogado. `true` apenas se a linha existe E
   * ainda não expirou (linhas expiradas são removidas pelo cleanup, mas a
   * checagem também é tolerante: se `expiresAt <= now`, considera não-revogado
   * — o JWT original também já expirou nesse ponto, então a checagem
   * subsequente de `exp` no JwtAuthGuard bloquearia de qualquer forma).
   */
  async isRevoked(jti: string): Promise<boolean> {
    const row = await this.prisma.revokedJti.findUnique({
      where: { jti },
      select: { expiresAt: true },
    });
    if (!row) return false;
    if (row.expiresAt.getTime() <= Date.now()) return false;
    return true;
  }

  private async purgeExpired(): Promise<void> {
    const { count } = await this.prisma.revokedJti.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (count > 0) {
      this.logger.debug(`Blacklist cleanup: removed ${count} expired entries`);
    }
  }
}
