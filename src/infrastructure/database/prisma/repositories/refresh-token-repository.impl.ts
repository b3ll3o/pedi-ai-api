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
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
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
}
