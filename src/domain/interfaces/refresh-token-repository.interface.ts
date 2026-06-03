import { RefreshToken } from '../entities/refresh-token.entity';

export const IREFRESH_TOKEN_REPOSITORY = 'IREFRESH_TOKEN_REPOSITORY';

export interface IRefreshTokenRepository {
  create(token: string, userId: string, expiresAt: Date): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  /**
   * Rotação atômica: deleta o token antigo e cria o novo dentro de uma transação
   * para impedir race conditions em que dois requests concorrentes tentam
   * rotacionar o mesmo token (o segundo delete falharia com P2025).
   */
  rotate(
    oldToken: string,
    newToken: string,
    userId: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
}
