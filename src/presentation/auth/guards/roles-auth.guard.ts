import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  IPERFIS_REPOSITORY,
  IPerfisRepository,
} from '../../../domain/interfaces/perfis-repository.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Roles } from '../enums/roles.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

// Cache TTL curto (30s) para evitar o N+1 do RolesAuthGuard: sem ele, todo
// request admin faz um findById extra no DB só para checar o nome do perfil.
// 30s é folgado para o caso comum (perfil do próprio user é estável) e curto
// o suficiente para que uma revogação de admin demore no máximo 30s para
// propagar (vs. o TTL do access token, que é 15min).
const PERFIL_CACHE_TTL_MS = 30_000;

interface CachedPerfil {
  nome: string;
  cachedAt: number;
}

@Injectable()
export class RolesAuthGuard extends AuthGuard('jwt') {
  // Map<perfilId, CachedPerfil>. Set por instância do guard (singleton via
  // DI), não global, então multi-tenant ou worker clusters não vazam dados.
  // Bound pequeno (perfis de fato são < 100); sem eviction é OK porque entradas
  // expiram pelo `cachedAt` e entradas novas sobrescrevem antigas.
  private readonly cache = new Map<string, CachedPerfil>();

  constructor(
    protected reflector: Reflector,
    @Inject(IPERFIS_REPOSITORY) protected readonly perfisRepository: IPerfisRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      throw new UnauthorizedException();
    }

    return this.checkRoles(context);
  }

  // Extraído de canActivate para que os testes consigam exercitar o caminho
  // de role check (e o cache) sem precisar mockar o JwtAuthGuard pai.
  // O super.canActivate acima continua sendo o ponto de entrada que valida
  // o JWT real — esta função assume req.user já populado.
  //
  // @visibleForTesting: esta função **NÃO** valida o JWT. Bypassa
  // super.canActivate() por design — só deve ser chamada DEPOIS que o JWT
  // já foi validado (em produção, isso é garantido pelo canActivate deste
  // mesmo guard). Em testes, é invocada diretamente para exercitar o cache
  // e o role check em isolamento. Não invoque de outros pontos do código.
  async checkRoles(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { perfilId } = request.user;

    if (!perfilId) {
      throw new ForbiddenException('Usuário sem perfil associado');
    }

    let perfilNome: string | null = null;
    const cached = this.cache.get(perfilId);
    const now = Date.now();
    if (cached && now - cached.cachedAt < PERFIL_CACHE_TTL_MS) {
      perfilNome = cached.nome;
    } else {
      const perfil = await this.perfisRepository.findById(perfilId);
      if (!perfil || perfil.deletedAt !== null) {
        throw new ForbiddenException('Perfil não encontrado ou inativo');
      }
      perfilNome = perfil.nome;
      this.cache.set(perfilId, { nome: perfilNome, cachedAt: now });
    }

    const hasRole = requiredRoles.some((role) => perfilNome === role);

    if (!hasRole) {
      throw new ForbiddenException('Acesso insuficiente');
    }

    return true;
  }
}
