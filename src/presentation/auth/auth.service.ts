import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { IUsuariosRepository } from '../../domain/interfaces/usuarios-repository.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { ISenhaHashService } from '../../domain/services/senha-hash.service';
import { IUSUARIOS_REPOSITORY } from '../../domain/interfaces/usuarios-repository.interface';
import { IREFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/refresh-token-repository.interface';
import { ISENHA_HASH_SERVICE } from '../../domain/services/senha-hash.service';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { TokenResponseDto } from '../../application/auth/dto/token-response.dto';
import { RefreshTokenDto } from '../../application/auth/dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_EXPIRES_IN = '15m';
  private readonly JWT_REFRESH_EXPIRES_IN = '7d';

  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
    @Inject(IREFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(ISENHA_HASH_SERVICE) private readonly senhaHashService: ISenhaHashService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const usuario = await this.usuariosRepository.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!usuario.senha) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await this.senhaHashService.compare(loginDto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateTokens(usuario.id, usuario.email, usuario.perfilId ?? null);
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<Omit<TokenResponseDto, 'refreshToken' | 'tokenType'>> {
    const refreshToken = await this.refreshTokenRepository.findByToken(
      refreshTokenDto.refreshToken,
    );

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(refreshTokenDto.refreshToken);
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const usuario = await this.usuariosRepository.findById(refreshToken.userId);

    if (!usuario) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    await this.refreshTokenRepository.deleteByToken(refreshTokenDto.refreshToken);

    return this.generateAccessToken(usuario.id, usuario.email, usuario.perfilId ?? null);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }

  private async generateTokens(
    userId: string,
    email: string,
    perfilId: string | null,
  ): Promise<TokenResponseDto> {
    const accessToken = await this.generateAccessToken(userId, email, perfilId);
    const refreshToken = await this.generateRefreshToken(userId);

    return {
      ...accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private async generateAccessToken(
    userId: string,
    email: string,
    perfilId: string | null,
  ): Promise<Omit<TokenResponseDto, 'refreshToken' | 'tokenType'>> {
    const payload = { sub: userId, email, perfilId };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_EXPIRES_IN,
    });

    return {
      accessToken,
      expiresIn: 900,
    };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create(refreshToken, userId, expiresAt);

    return refreshToken;
  }

  async validateUser(userId: string) {
    const usuario = await this.usuariosRepository.findById(userId);
    return usuario;
  }
}
