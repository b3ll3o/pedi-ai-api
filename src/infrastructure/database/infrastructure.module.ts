import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosRepositoryImpl } from './prisma/repositories/usuarios-repository.impl';
import { PerfisRepositoryImpl } from './prisma/repositories/perfis-repository.impl';
import { PermissoesRepositoryImpl } from './prisma/repositories/permissoes-repository.impl';
import { IUsuariosRepository } from '../../domain/interfaces/usuarios-repository.interface';
import { IPerfisRepository } from '../../domain/interfaces/perfis-repository.interface';
import { IPermissoesRepository } from '../../domain/interfaces/permissoes-repository.interface';

export const USUARIOS_REPOSITORY = Symbol('IUsuariosRepository');
export const PERFIS_REPOSITORY = Symbol('IPerfisRepository');
export const PERMISSOES_REPOSITORY = Symbol('IPermissoesRepository');

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USUARIOS_REPOSITORY,
      useClass: UsuariosRepositoryImpl,
    },
    {
      provide: PERFIS_REPOSITORY,
      useClass: PerfisRepositoryImpl,
    },
    {
      provide: PERMISSOES_REPOSITORY,
      useClass: PermissoesRepositoryImpl,
    },
  ],
  exports: [USUARIOS_REPOSITORY, PERFIS_REPOSITORY, PERMISSOES_REPOSITORY],
})
export class InfrastructureModule {}