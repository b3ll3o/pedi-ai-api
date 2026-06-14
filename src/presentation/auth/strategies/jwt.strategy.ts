import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../../../infrastructure/auth/token-blacklist.service';

export interface JwtPayload {
  sub: string;
  perfilId: string | null;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Janela curta (em ms) durante a qual o resultado de `validateUser` é
 * cacheado por userId. Reduz N round-trips ao DB em rajadas de requests
 * autenticados (ex: dashboard carrega 4-5 endpoints em paralelo), com a
 * contrapartida de um atraso de até `CACHE_TTL_MS` para refletir um
 * soft-delete/desativação imediata do usuário. Para esse projeto, 5s
 * é aceitável — perfil/permissão são read-heavy, e o JWT expira em 15min.
 */
const CACHE_TTL_MS = 5_000;

interface CacheEntry {
  valid: boolean;
  expiresAt: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly validationCache = new Map<string, CacheEntry>();

  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      // `algorithms` explícito: sem isso, passport-jwt aceita qualquer
      // algoritmo que ele conheça (incluindo `none` em algumas versões), abrindo
      // a porta para ataques de algorithm confusion (forjar `alg: none` ou
      // HS256 com a chave pública de um serviço RS256 mal configurado).
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // Verifica o jti (não o token inteiro) contra a blacklist no Postgres.
    // Como cada access token tem um jti único, o índice em `revoked_jtis`
    // resolve em ~1ms — bem mais barato que armazenar o token inteiro.
    if (payload.jti && (await this.tokenBlacklist.isRevoked(payload.jti))) {
      throw new UnauthorizedException('Token revogado');
    }

    const cached = this.validationCache.get(payload.sub);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.valid) {
        throw new UnauthorizedException();
      }
      return {
        userId: payload.sub,
        perfilId: payload.perfilId,
      };
    }

    const user = await this.authService.validateUser(payload.sub);
    const valid = user !== null;
    this.validationCache.set(payload.sub, {
      valid,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    // Higieniza entradas expiradas em cada insert. O mapa raramente passa
    // de algumas centenas de entradas (uma por usuário ativo), então um
    // scan linear é mais barato que manter timestamps separados.
    if (this.validationCache.size > 256) {
      const now = Date.now();
      for (const [key, entry] of this.validationCache) {
        if (entry.expiresAt <= now) this.validationCache.delete(key);
      }
    }

    if (!valid) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      perfilId: payload.perfilId,
    };
  }
}
