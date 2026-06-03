import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosRepositoryImpl } from './prisma/repositories/usuarios-repository.impl';
import { PerfisRepositoryImpl } from './prisma/repositories/perfis-repository.impl';
import { PermissoesRepositoryImpl } from './prisma/repositories/permissoes-repository.impl';
import { RefreshTokenRepositoryImpl } from './prisma/repositories/refresh-token-repository.impl';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    UsuariosRepositoryImpl,
    PerfisRepositoryImpl,
    PermissoesRepositoryImpl,
    RefreshTokenRepositoryImpl,
    TokenBlacklistService,
  ],
  exports: [
    UsuariosRepositoryImpl,
    PerfisRepositoryImpl,
    PermissoesRepositoryImpl,
    RefreshTokenRepositoryImpl,
    TokenBlacklistService,
  ],
})
export class InfrastructureModule {}
