import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosRepositoryImpl } from './prisma/repositories/usuarios-repository.impl';
import { PerfisRepositoryImpl } from './prisma/repositories/perfis-repository.impl';
import { PermissoesRepositoryImpl } from './prisma/repositories/permissoes-repository.impl';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [UsuariosRepositoryImpl, PerfisRepositoryImpl, PermissoesRepositoryImpl],
  exports: [UsuariosRepositoryImpl, PerfisRepositoryImpl, PermissoesRepositoryImpl],
})
export class InfrastructureModule {}
