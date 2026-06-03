import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IRefreshTokenRepository } from '../../../../domain/interfaces/refresh-token-repository.interface';
import { RefreshToken } from '../../../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepositoryImpl implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(token: string, userId: string, expiresAt: Date): Promise<RefreshToken> {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
    return refreshToken as RefreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    // `select` explícito para nunca trazer `user.senha`: o caller (auth.service)
    // só usa `userId`, mas include: { user: true } puxa o hash pra memória.
    // Custo zero, defesa contra refactor futuro que esqueça do filter.
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, perfilId: true, deletedAt: true },
        },
      },
    });
    return refreshToken as RefreshToken | null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async rotate(
    oldToken: string,
    newToken: string,
    userId: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return (await this.prisma.$transaction(async (tx) => {
      // delete + create atômico: se a delete falhar, a create não acontece.
      await tx.refreshToken.delete({ where: { token: oldToken } });
      return tx.refreshToken.create({
        data: { token: newToken, userId, expiresAt },
      });
    })) as RefreshToken;
  }
}
