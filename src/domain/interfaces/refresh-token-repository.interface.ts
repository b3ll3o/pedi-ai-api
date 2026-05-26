import { RefreshToken } from '../entities/refresh-token.entity';

export const IREFRESH_TOKEN_REPOSITORY = 'IREFRESH_TOKEN_REPOSITORY';

export interface IRefreshTokenRepository {
  create(token: string, userId: string, expiresAt: Date): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}
