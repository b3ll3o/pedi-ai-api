import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IUsuariosRepository,
  IUSUARIOS_REPOSITORY,
} from '../../domain/interfaces/usuarios-repository.interface';
import {
  IRefreshTokenRepository,
  IREFRESH_TOKEN_REPOSITORY,
} from '../../domain/interfaces/refresh-token-repository.interface';
import {
  IPerfisRepository,
  IPERFIS_REPOSITORY,
} from '../../domain/interfaces/perfis-repository.interface';
import { ISenhaHashService, ISENHA_HASH_SERVICE } from '../../domain/services/senha-hash.service';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { TokenResponseDto } from '../../application/auth/dto/token-response.dto';
import { RefreshTokenDto } from '../../application/auth/dto/refresh-token.dto';
import { TokenBlacklistService } from '../../infrastructure/auth/token-blacklist.service';
import { handlePrismaError } from '../../common/prisma-errors';

// Hash bcrypt pré-computado para equalizar timing de login quando o usuário
// não existe. Comparar contra um hash dummy custa o mesmo tempo de CPU que
// comparar contra o hash real (~100ms em 12 rounds), impedindo que o atacante
// enumere emails pela diferença de latência.
const DUMMY_BCRYPT_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8pP3R8Vj1xXrZ9qHK7bZ4YtFb4cS9m';

// Nome canônico do perfil default atribuído em self-register.
const DEFAULT_PERFIL_NOME = 'USUARIO';

@Injectable()
export class AuthService {
  // O tipo StringValue (template literal) é exigido por @nestjs/jwt 11+; o cast
  // é seguro porque validamos o formato em parseExpiresIn() no momento do uso.
  private readonly JWT_ACCESS_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
    '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`;
  private readonly JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ??
    '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`;

  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
    @Inject(IREFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(IPERFIS_REPOSITORY)
    private readonly perfisRepository: IPerfisRepository,
    @Inject(ISENHA_HASH_SERVICE) private readonly senhaHashService: ISenhaHashService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const usuario = await this.usuariosRepository.findByEmail(loginDto.email);

    // Sempre rodar bcrypt contra o hash real OU o dummy para equalizar timing
    const hashToCompare = usuario?.senha ?? DUMMY_BCRYPT_HASH;
    const senhaValida = await this.senhaHashService.compare(loginDto.senha, hashToCompare);

    if (!usuario || !senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateTokens(usuario.id, usuario.perfilId ?? null);
  }

  async register(data: { nome: string; email: string; senha: string }): Promise<TokenResponseDto> {
    const emailNormalizado = data.email.toLowerCase().trim();
    const existingUser =
      await this.usuariosRepository.findByEmailIncludingDeleted(emailNormalizado);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedSenha = await this.senhaHashService.hash(data.senha);

    // Self-register atribui o perfil USUARIO por default para que o usuário
    // não fique permanentemente sem role no sistema.
    const perfilDefault = await this.perfisRepository.findByNome(DEFAULT_PERFIL_NOME);
    const perfilId = perfilDefault?.id ?? null;

    let usuario: Awaited<ReturnType<IUsuariosRepository['create']>>;
    try {
      usuario = await this.usuariosRepository.create({
        nome: data.nome,
        email: emailNormalizado,
        senha: hashedSenha,
        ...(perfilId ? { perfilId } : {}),
      });
    } catch (error) {
      handlePrismaError(error, 'Email já cadastrado');
    }

    return this.generateTokens(usuario!.id, usuario!.perfilId ?? null);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
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

    // Rotação atômica: deleta o antigo e cria o novo dentro de uma transação
    // para impedir que dois requests concorrentes com o mesmo refresh token
    // ambos passem pelo findByToken e o segundo delete retorne 500 (P2025).
    const newRefreshToken = await this.generateRefreshTokenTransactional(
      refreshTokenDto.refreshToken,
      usuario.id,
    );

    const accessToken = await this.generateAccessToken(usuario.id, usuario.perfilId ?? null);

    return {
      ...accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    };
  }

  async logout(userId: string, accessToken?: string): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as { exp?: number } | null;
        if (decoded?.exp) {
          this.tokenBlacklist.revoke(accessToken, decoded.exp * 1000);
        }
      } catch {
        // Token inválido — não revoga
      }
    }
  }

  private async generateTokens(userId: string, perfilId: string | null): Promise<TokenResponseDto> {
    const accessToken = await this.generateAccessToken(userId, perfilId);
    const refreshToken = await this.generateRefreshToken(userId);

    return {
      ...accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private async generateAccessToken(
    userId: string,
    perfilId: string | null,
  ): Promise<Omit<TokenResponseDto, 'refreshToken' | 'tokenType'>> {
    // Email deliberadamente fora do payload: é PII desnecessária (o backend
    // revalida via DB no JwtStrategy.validate) e qualquer log de token
    // (ex: jwt.io, logs de proxy) vaza o email do usuário.
    const payload = { sub: userId, perfilId };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_EXPIRES_IN,
    });

    // Deriva expiresIn do próprio `exp` claim do token assinado em vez de
    // re-parsear o env var: garante que o valor reportado ao cliente bate
    // exatamente com o que o JWT contém, sem drift se a string for malformada.
    const expiresIn = this.expiresInFromToken(accessToken);

    return {
      accessToken,
      expiresIn,
    };
  }

  private expiresInFromToken(token: string): number {
    const decoded = this.jwtService.decode(token) as { exp?: number; iat?: number } | null;
    if (!decoded?.exp || !decoded?.iat) {
      // Fallback defensivo: se o token não tem exp/iat (não deveria acontecer
      // com @nestjs/jwt), usa o parser do env var.
      return this.parseExpiresInSeconds(this.JWT_ACCESS_EXPIRES_IN);
    }
    return Math.max(0, decoded.exp - decoded.iat);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh', jti: this.generateJti() };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });

    const expiresAt = this.parseExpiresIn(this.JWT_REFRESH_EXPIRES_IN);

    await this.refreshTokenRepository.create(refreshToken, userId, expiresAt);

    return refreshToken;
  }

  private async generateRefreshTokenTransactional(
    oldToken: string,
    userId: string,
  ): Promise<string> {
    const newRefreshTokenJwt = await this.jwtService.signAsync(
      { sub: userId, type: 'refresh', jti: this.generateJti() },
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN },
    );
    const expiresAt = this.parseExpiresIn(this.JWT_REFRESH_EXPIRES_IN);

    try {
      await this.refreshTokenRepository.rotate(oldToken, newRefreshTokenJwt, userId, expiresAt);
    } catch (error) {
      handlePrismaError(error, 'Refresh token inválido ou expirado');
    }

    return newRefreshTokenJwt;
  }

  // JWT ID (RFC 7519 §4.1.7): random único por token garante que refresh
  // tokens emitidos no mesmo segundo para o mesmo user sejam distintos, mesmo
  // que payload + iat + secret coincidam (logins paralelos, retry, etc).
  // Sem isso, o unique constraint em refresh_tokens.token estoura P2002 e
  // o request cai no 500 do filtro global.
  private generateJti(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }

  // Cap superior de TTL. 90 dias é folgado para qualquer access token razoável
  // e bloqueia valores absurdos tipo `999999999h` que silenciosamente produzem
  // tokens "válidos por séculos" e mantêm a blacklist em memória indefinidamente.
  private static readonly MAX_EXPIRES_IN_SECONDS = 90 * 24 * 3_600;

  private parseExpiresIn(value: string): Date {
    const seconds = AuthService.parseExpiresInSeconds(value, 'JWT_REFRESH_EXPIRES_IN');
    const now = new Date();
    now.setSeconds(now.getSeconds() + seconds);
    return now;
  }

  private parseExpiresInSeconds(value: string): number {
    return AuthService.parseExpiresInSeconds(value, 'JWT_EXPIRES_IN');
  }

  private static parseExpiresInSeconds(value: string, envVarName: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      throw new Error(`${envVarName} inválido: "${value}" (esperado formato "15m", "7d", etc.)`);
    }
    const amount = parseInt(match[1], 10);
    if (amount <= 0) {
      throw new Error(`${envVarName} inválido: "${value}" (quantidade deve ser > 0)`);
    }
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3_600, d: 86_400 };
    const seconds = amount * multipliers[unit];
    if (seconds > AuthService.MAX_EXPIRES_IN_SECONDS) {
      throw new Error(
        `${envVarName} inválido: "${value}" (TTL máximo permitido: ${AuthService.MAX_EXPIRES_IN_SECONDS}s ≈ 90 dias)`,
      );
    }
    return seconds;
  }

  async validateUser(userId: string) {
    const usuario = await this.usuariosRepository.findById(userId);
    return usuario;
  }
}
