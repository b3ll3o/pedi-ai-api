import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IPERFIS_REPOSITORY, IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Roles } from '../enums/roles.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RolesAuthGuard extends AuthGuard('jwt') {
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

    const perfil = await this.perfisRepository.findById(perfilId);

    if (!perfil || perfil.deletedAt !== null) {
      throw new ForbiddenException('Perfil não encontrado ou inativo');
    }

    const hasRole = requiredRoles.some((role) => perfil.nome === role);

    if (!hasRole) {
      throw new ForbiddenException('Acesso insuficiente');
    }

    return true;
  }
}
